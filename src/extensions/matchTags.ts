/** @module match-tags */

import { Extension, PrismEditor } from ".."
import { getClosestToken } from "../utils"

const voidlessLangs = "xml,rss,atom,jsx,tsx".split(",")
const voidTags = "area,base,br,col,embed,hr,img,input,link,meta,source,track,wbr".split(",")

export interface TagMatcher {
	/**
	 * Array of tuples containing:
	 * - The tag's `Token`
	 * - Its starting position
	 * - Its leftmost punctuation length
	 * - Its ending position
	 * - Its tag name
	 * - Whether it's self-closing
	 */
	readonly tags: [Prism.Token, number, number, number, string, boolean][]
	/** Array mapping the index of a tag to the index of its matching tag. */
	readonly pairs: (number | undefined)[]
}

export interface TagHighlighter extends Extension {
	/**
	 * The tag matcher used by the extension.
	 * This property is only available after the extension is added to an editor.
	 */
	matcher?: TagMatcher
}

/**
 * Function that adds tag matching to the editor.
 * @returns An object containing all tags and pairs.
 */
export const createTagMatcher = (editor: PrismEditor): TagMatcher => {
	let pairMap: number[] = [],
		tags: [Prism.Token, number, number, number, string, boolean][] = [],
		stack: [number, string][],
		tagIndex: number,
		matchTags = (tokens: (Prism.Token | string)[], language: string) => {
			stack = []
			tags.length = pairMap.length = tagIndex = 0
			matchTagsRecursive(tokens, language, 0)
		},
		matchTagsRecursive = (tokens: (Prism.Token | string)[], language: string, position: number) => {
			for (let i = 0, noVoidTags = voidlessLangs.includes(language), l = tokens.length; i < l; ) {
				const token = <Prism.Token>tokens[i++],
					content = token.content,
					type = token.type,
					length = token.length
				if (Array.isArray(content)) {
					if (type == "tag") {
						let nameContent = <[Prism.Token, (string | Prism.Token)?]>(
							(<Prism.Token>content[0])?.content
						)
						if (nameContent && nameContent[0]) {
							let [{ length: openingLength }, tagName] = nameContent

							let closingLength = (<Prism.Token>content[content.length - 1]).length
							let selfClosing =
								closingLength > 1 || (!noVoidTags && voidTags.includes(<string>tagName))

							tagName = tagName ? <string>((<Prism.Token>tagName).content || tagName) : ""
							if (!selfClosing) {
								if (openingLength < 2) {
									stack.push([tagIndex, tagName])
								} else {
									for (let i = stack.length; i; ) {
										if (tagName == stack[--i][1]) {
											pairMap[(pairMap[tagIndex] = stack[i][0])] = tagIndex
											stack.length = i
											break
										}
									}
								}
							}

							tags[tagIndex++] = [
								token,
								position,
								openingLength,
								position + length,
								tagName,
								selfClosing,
							]
						}
					} else
						matchTagsRecursive(
							content,
							type.indexOf("language-") ? language : type.slice(9),
							position,
						)
				}
				position += length
			}
		}

	editor.addListener("tokenize", env => {
		matchTags(env.tokens, env.language)
	})

	matchTags(editor.tokens, editor.options.language)

	return (editor.extensions.matchTags = {
		tags,
		pairs: pairMap,
	})
}

const getClosestTagIndex = (pos: number, tags: TagMatcher["tags"]) => {
	for (let i = 0, l = tags.length; i < l && tags[i][1] <= pos; i++) if (tags[i][3] >= pos) return i
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
export const matchTags = (): TagHighlighter => ({
	update(editor) {
		this.update = () => {}
		let openEl: HTMLSpanElement, closeEl: HTMLSpanElement
		const { tags, pairs } = (this.matcher = editor.extensions.matchTags || createTagMatcher(editor))
		const highlight = (remove?: boolean) =>
			[openEl, closeEl].forEach(el => {
				el && el.classList.toggle("active-tagname", !remove)
			})

		const selectionChange = () => {
			let [start, end] = editor.getSelection()
			let newEl1: HTMLSpanElement
			let newEl2: HTMLSpanElement
			if (start == end && editor.focused) {
				let index = getClosestTagIndex(start, tags)!

				if (index + 1) {
					const tag1 = getClosestToken(editor, ".tag>.tag", -tags[index][2], 0)
					const otherIndex = pairs[index]!

					if (tag1 && otherIndex + 1) {
						const tag2 = getClosestToken(editor, ".tag>.tag", 0, 0, tags[otherIndex][1])!
						;[newEl1, newEl2] = [tag1, tag2].map(el => {
							let child = el.lastChild!
							let tagName = (<Text>child).data
							if (tagName) {
								child.replaceWith((child = document.createElement("span")))
								child.textContent = tagName
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
		}
		editor.addListener("selectionChange", selectionChange)
	},
})

/**
 * Extension that highlights `<` and `>` punctuation in XML tags.
 * @param className Class name used to highlight the punctuation.
 * @param alwaysHighlight If true, the punctuation will always be highlighted when the cursor
 * is inside a tag. If not it will only be highlighted when the cursor is on the punctuation.
 */
export const highlightTagPunctuation = (
	className: string,
	alwaysHighlight?: boolean,
): TagHighlighter => ({
	update(editor) {
		this.update = () => {}
		let openEl: HTMLSpanElement, closeEl: HTMLSpanElement
		const { tags } = (this.matcher = editor.extensions.matchTags || createTagMatcher(editor))
		const highlight = (remove?: boolean) =>
			[openEl, closeEl].forEach(el => {
				el && el.classList.toggle(className, !remove)
			})

		const selectionChange = () => {
			let [start, end] = editor.getSelection()
			let newEl1: HTMLSpanElement
			let newEl2: HTMLSpanElement
			if (start == end) {
				let tag = tags[editor.focused ? getClosestTagIndex(start, tags)! : -1]

				if (
					tag &&
					(alwaysHighlight ||
						(!getClosestToken(editor, ".tag>.tag", -tag[2], 0) &&
							getClosestToken(editor, ".tag>.punctuation", 0, -(end == tag[3]), tag[1])))
				) {
					newEl1 = getClosestToken(editor, ".tag>.punctuation", 0, 0, tag[1])!
					newEl2 = getClosestToken(editor, ".tag>.punctuation", 0, 0, tag[3] - 1)!
				}
			}
			if (openEl != newEl1!) {
				highlight(true)
				openEl = newEl1!
				closeEl = newEl2!
				highlight()
			}
		}
		editor.addListener("selectionChange", selectionChange)
		editor.textarea.addEventListener("focus", () => selectionChange())
		editor.textarea.addEventListener("blur", () => selectionChange())
	},
})
