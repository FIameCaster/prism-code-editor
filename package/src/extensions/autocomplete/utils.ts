import { PrismEditor } from "../../index.js"
import { Token } from "../../prism/core.js"
import { TokenStream } from "../../prism/types.js"
import { matchTemplate } from "../search/search.js"
import { Completion, CompletionContext, CompletionSource } from "./types.js"

const optionsFromKeys = (obj: object, icon?: string): Completion[] =>
	Object.keys(obj).map(tag => ({ label: tag, icon }))

const updateNode = (node: Text, text: string) => {
	if (node.data != text) node.data = text
}

const updateMatched = (container: HTMLElement, matched: number[], text: string) => {
	let nodes = container.childNodes
	let nodeCount = nodes.length - 1
	let pos = 0
	let i = 0
	let l = matched.length

	for (; i < l; ) {
		if (i >= nodeCount) {
			nodes[i].before("", matchTemplate())
		}
		updateNode(nodes[i] as Text, text.slice(pos, (pos = matched[i++])))
		updateNode(nodes[i].firstChild as Text, text.slice(pos, (pos = matched[i++])))
	}
	for (; nodeCount > i; ) {
		nodes[--nodeCount].remove()
	}
	updateNode(nodes[l] as Text, text.slice(pos))
}

/**
 * Completion source that returns a list of snippets if `path` property of the context
 * is present and only contains a single string.
 * @param snippets Snippets to complete.
 */
const completeSnippets = (snippets: Completion[]): CompletionSource<{ path: string[] | null }> => {
	return ({ path, explicit, pos }) => {
		if (path?.length == 1 && (path[0] || explicit)) {
			return {
				from: pos - path[0].length,
				options: snippets,
			}
		}
	}
}

/**
 * Utility that searches the editor's {@link TokenStream} for strings.
 * @param context Current completion context.
 * @param editor Editor to search in.
 * @param filter Function used to filter tokens you want to search in. Is called with the
 * type of the token and its starting position. If the filter returns true, the token
 * will be searched.
 * @param pattern Pattern used to search for words.
 * @param init Words to initialize the result with.
 * @param tokensOnly If `true` only the text of tokens whoose `content` is a string will
 * be searched. If not any string inside the {@link TokenStream} can be searched.
 * @returns An array with found identifers/words.
 */
const findWords = (
	context: CompletionContext,
	editor: PrismEditor,
	filter: (type: string, start: number) => boolean,
	pattern: RegExp,
	init?: Iterable<string>,
	tokensOnly?: boolean,
) => {
	const cursorPos = context.pos
	const language = context.language
	const result = new Set(init)
	const search = (tokens: TokenStream, pos: number, isCorrectLang: boolean) => {
		let i = 0
		let token: string | Token
		if (isCorrectLang) {
			for (; (token = tokens[i++]); ) {
				if (typeof token == "string") {
					if (!tokensOnly) match(token, pos)
				} else {
					const type = token.type
					const content = token.content
					if ((token.alias || type).slice(0, 9) != "language-" && filter(type, pos)) {
						if (Array.isArray(content)) {
							search(content, pos, true)
						} else match(content, pos)
					}
				}
				pos += token.length
			}
		} else {
			for (; (token = tokens[i++]); ) {
				if (typeof token != "string") {
					const type = token.type
					const content = token.content
					if (Array.isArray(content)) {
						const aliasType = token.alias || type
						search(
							content,
							pos,
							aliasType.slice(0, 9) == "language-" ? aliasType.slice(9) == language : false,
						)
					}
				}
				pos += token.length
			}
		}
	}
	const match = (token: string, pos: number) => {
		let match: RegExpExecArray | null
		while ((match = pattern.exec(token))) {
			let start = pos + match.index
			let str = match[0]
			if (start > cursorPos || start + str.length < cursorPos) result.add(str)
		}
	}

	search(editor.tokens, 0, language == editor.options.language)

	return [...result]
}

export { optionsFromKeys, updateMatched, updateNode, findWords, completeSnippets }
