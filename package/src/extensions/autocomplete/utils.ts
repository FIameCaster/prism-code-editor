import { PrismEditor } from "../../index.js"
import { Token } from "../../prism/core.js"
import { TokenStream } from "../../prism/types.js"
import { matchTemplate } from "../search/search.js"
import { Completion, CompletionContext } from "./types.js"

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

const findIdentifiers = (
	{ language, pos: cursorPos }: CompletionContext,
	editor: PrismEditor,
	filter: (type: string) => boolean,
	pattern: RegExp,
	tokensOnly?: boolean,
) => {
	const result = new Set<string>()
	const search = (tokens: TokenStream, pos: number, isCorrectLang: boolean) => {
		let i = 0
		let token: string | Token
		if (isCorrectLang) {
			for (; (token = tokens[i]); i++) {
				if (typeof token == "string") {
					if (!tokensOnly) match(token, pos)
				} else {
					const type = token.type
					const content = token.content
					if ((token.alias || type).slice(0, 9) != "language-" && filter(type)) {
						if (Array.isArray(content)) {
							search(content, pos, true)
						} else match(content, pos)
					}
				}
				pos += token.length
			}
		} else {
			for (; (token = tokens[i]); i++) {
				if (typeof token != "string") {
					const type = token.type
					const content = token.content
					const end = pos + token.length
					if (end > cursorPos) return
					if (pos <= cursorPos && Array.isArray(content)) {
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

export { optionsFromKeys, updateMatched, updateNode, findIdentifiers }
