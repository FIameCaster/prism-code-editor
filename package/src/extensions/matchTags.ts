/** @module match-tags */

import { PrismEditor, SetupExtension } from ".."
import { Token, TokenStream } from "../prism"
import { getClosestToken } from "../utils"
import { addTextareaListener } from "../utils/local"

const voidlessLangs = "xml,rss,atom,jsx,tsx".split(",")
const voidTags = "area,base,br,col,embed,hr,img,input,link,meta,source,track,wbr".split(",")

export interface TagMatcher {
	/**
	 * Array of tuples containing in the following order:
	 * - The tag's `Token`
	 * - Its starting position
	 * - Its leftmost punctuation length
	 * - Its ending position
	 * - Its tag name
	 * - Whether it's self-closing
	 */
	readonly tags: [Token, number, number, number, string, boolean][]
	/** Array mapping the index of a tag to the index of its matching tag. */
	readonly pairs: (number | undefined)[]
}

/**
 * Function that adds tag matching to the editor.
 * @returns An object containing all tags and pairs.
 */
export const createTagMatcher = (editor: PrismEditor): TagMatcher => {
	let pairMap: number[] = [],
		tags: [Token, number, number, number, string, boolean][] = [],
		stack: [number, string][],
		tagIndex: number,
		matchTags = (tokens: TokenStream, language: string) => {
			stack = []
			tags.length = pairMap.length = tagIndex = 0
			matchTagsRecursive(tokens, language, 0)
		},
		matchTagsRecursive = (tokens: TokenStream, language: string, position: number) => {
			for (let i = 0, noVoidTags = voidlessLangs.includes(language), l = tokens.length; i < l; ) {
				const token = <Token>tokens[i++],
					content = token.content,
					type = token.type,
					length = token.length
				if (Array.isArray(content)) {
					if (type == "tag") {
						if ((<Token>content[0]).content) {
							const value = editor.value
							const offset = content[0].length
							const isClosing = value[position + 1] == "/"
							const tagName = value.slice(position + 1 + <any>isClosing, position + offset)
							const selfClosing =
								value[position + length - 2] == "/" ||
								(!noVoidTags && voidTags.includes(<string>tagName))

							if (content[2] && noVoidTags)
								matchTagsRecursive(content.slice(1, -1), language, position + offset)

							if (!selfClosing) {
								if (isClosing) {
									for (let i = stack.length; i; ) {
										if (tagName == stack[--i][1]) {
											pairMap[(pairMap[tagIndex] = stack[i][0])] = tagIndex
											stack.length = i
											i = 0
										}
									}
								} else {
									stack.push([tagIndex, tagName])
								}
							}

							tags[tagIndex++] = [
								token,
								position,
								1 + <any>isClosing,
								position + length,
								tagName,
								selfClosing,
							]
						}
					} else {
						let lang = token.alias || type
						matchTagsRecursive(
							content,
							lang.indexOf("language-") ? language : (<string>lang).slice(9),
							position,
						)
					}
				}
				position += length
			}
		}

	editor.addListener("tokenize", matchTags)

	matchTags(editor.tokens, editor.options.language)

	return (editor.extensions.matchTags = {
		tags,
		pairs: pairMap,
	})
}

const getClosestTagIndex = (pos: number, tags: TagMatcher["tags"]) => {
	for (let i = 0, l = tags.length; i < l; i++) if (tags[i][1] <= pos && tags[i][3] >= pos) return i
}

/**
 * Extension that adds classes to matching HTML/XML/JSX tags. If the editor doesn't
 * have a {@link TagMatcher}, one is created. Obviously don't add this if the languages
 * used don't have tags.
 *
 * Use the CSS selectors `.active-tagname` to style the elements.
 *
 * This extension can safely be added dynamically to an editor.
 */
export const matchTags = (): SetupExtension => editor => {
	let openEl: HTMLSpanElement, closeEl: HTMLSpanElement
	const { tags, pairs } = editor.extensions.matchTags || createTagMatcher(editor)
	const highlight = (remove?: boolean) =>
		[openEl, closeEl].forEach(el => {
			el && el.classList.toggle("active-tagname", !remove)
		})

	editor.addListener("selectionChange", ([start, end]) => {
		let newEl1: HTMLSpanElement
		let newEl2: HTMLSpanElement
		if (start == end && editor.focused) {
			let index = getClosestTagIndex(start, tags)!
			let tag = tags[index]

			if (tag && tag[4]) {
				const tag1 = getClosestToken(editor, ".tag>.tag", -tag[2], 0)
				const otherIndex = pairs[index]!

				if (tag1 && otherIndex + 1) {
					const tag2 = getClosestToken(editor, ".tag>.tag", 0, 0, tags[otherIndex][1])!
					;[newEl1, newEl2] = [tag1, tag2].map(el => {
						let children = el.childNodes
						let child = children[1]
						if (children[2] || (<Text>child).data) {
							child = document.createElement("span")
							;(<HTMLElement>child).append(...[].slice.call(children, 1))
							el.append(child)
						}
						return <HTMLSpanElement>child
					})
				}
			}
		}
		if (openEl != newEl1!) {
			highlight(true)
			openEl = newEl1!
			closeEl = newEl2!
			highlight()
		}
	})
}

/**
 * Extension that highlights `<` and `>` punctuation in XML tags.
 * @param className Class added to the active punctuation you can use to style them with CSS.
 * @param alwaysHighlight If true, the punctuation will always be highlighted when the cursor
 * is inside a tag. If not it will only be highlighted when the cursor is on the punctuation.
 */
export const highlightTagPunctuation =
	(className: string, alwaysHighlight?: boolean): SetupExtension =>
	editor => {
		let openEl: HTMLSpanElement, closeEl: HTMLSpanElement
		const { tags } = editor.extensions.matchTags || createTagMatcher(editor)
		const getPunctuation = (pos?: number) => getClosestToken(editor, ".tag>.punctuation", 0, 0, pos)
		const highlight = (remove?: boolean) =>
			[openEl, closeEl].forEach(el => {
				el && el.classList.toggle(className, !remove)
			})

		const selectionChange = () => {
			let [start, end] = editor.getSelection()
			let newEl1: HTMLSpanElement
			let newEl2: HTMLSpanElement
			if (start == end && editor.focused) {
				let tag = tags[getClosestTagIndex(start, tags)!]

				if (
					tag &&
					(alwaysHighlight ||
						((end < tag[1] + tag[2] || end > tag[1] + tag[2] + tag[4].length) && getPunctuation()))
				) {
					newEl1 = getPunctuation(tag[1])!
					newEl2 = getPunctuation(tag[3] - 1)!
				}
			}
			if (openEl != newEl1! || closeEl != newEl2!) {
				highlight(true)
				openEl = newEl1!
				closeEl = newEl2!
				highlight()
			}
		}
		editor.addListener("selectionChange", selectionChange)
		addTextareaListener(editor, "focus", selectionChange)
		addTextareaListener(editor, "blur", selectionChange)
	}
