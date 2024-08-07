import { regexEscape } from "../../utils/index.js"
import { createTemplate } from "../../core.js"
import { PrismEditor } from "../../types.js"

const searchTemplate = createTemplate(
	'<div style="color:#0000;contain:strict;padding:0 var(--_pse) 0 var(--padding-left)" aria-hidden=true> ',
)

const matchTemplate = createTemplate("<span> ")

const testBoundary = (str: string, position: number, pattern = /[_\p{N}\p{L}]{2}/u) => {
	if (!position) return false
	return pattern.test(
		str.slice(
			position - (str.codePointAt(position - 2)! > 0xffff ? 2 : 1),
			position + (str.codePointAt(position)! > 0xffff ? 2 : 1),
		),
	)
}

export type SearchFilter = (start: number, end: number) => boolean

/** Object with methods useful for performing a search and highlighting the matches. */
export interface SearchAPI {
	/**
	 * Unhides the search container and highlights all matches of the specified string in the editor.
	 * @param str String to search for.
	 * @param caseSensitive Whether or not the search is case sensetive.
	 * @param wholeWord Whether or not matches must be surrounded by word boundries.
	 * @param useRegExp If true, special characters won't be escaped when creating the RegExp.
	 * @param selection Boundries to search between. If excluded, all the code is searched.
	 * @param filter A function called for each match with the start and end positions of the match.
	 * If it returns false, the match won't be included.
	 * @param wholeWordBoundry Pattern controlling the behavior of whole word search. Best left
	 * undefined unless you know what you're doing. Does nothing if `wholeWord` isn't set to `true`.
	 * Defaults to `/[_\p{N}\p{L}]{2}/u`.
	 * @returns An error message if the RegExp was invalid.
	 */
	search(
		str: string,
		caseSensitive?: boolean,
		wholeWord?: boolean,
		useRegExp?: boolean,
		selection?: [number, number],
		filter?: SearchFilter,
		wholeWordBoundry?: RegExp,
	): string | void
	/** Container that all the search results are appended to. */
	readonly container: HTMLDivElement
	/** Current regex used for searching. */
	readonly regex: RegExp
	/** Array of positions of all the matches. */
	readonly matches: [number, number][]
	/** Hides the search container and removes all the matches. */
	stopSearch(): void
}

/** Function adding search functionality to an editor. */
const createSearchAPI = (editor: PrismEditor): SearchAPI => {
	const container = searchTemplate()
	const nodes: ChildNode[] = [container.firstChild!]
	const nodeValues: string[] = [" "]
	const matchPositions: [number, number][] = []
	const stopSearch = () => {
		if (matchPositions[0]) {
			matchPositions.length = 0
			container.remove()
		}
	}

	let regex: RegExp
	let nodeCount = 1

	return {
		search(str, caseSensitive, wholeWord, useRegExp, selection, filter, pattern) {
			if (!str) return stopSearch()
			if (!useRegExp) str = regexEscape(str)
			const value = editor.value
			const searchStr = selection ? value.slice(...selection) : value
			const offset = selection ? selection[0] : 0

			let match: RegExpExecArray | null
			let l: number
			let index: number
			let i = 0

			try {
				regex = RegExp(str, `gum${caseSensitive ? "" : "i"}`)
				while ((match = regex.exec(searchStr))) {
					l = match[0].length
					index = match.index + offset
					if (!l) regex.lastIndex += value.codePointAt(index)! > 0xffff ? 2 : 1
					if (
						wholeWord &&
						(testBoundary(value, index, pattern) || testBoundary(value, index + l, pattern))
					)
						continue
					if (!filter || filter(index, index + l)) matchPositions[i++] = [index, index + l]
				}
			} catch (e) {
				stopSearch()
				return (<Error>e).message
			}

			if (i) {
				matchPositions.length = i
				l = Math.min(i * 2, 20000)

				for (i = nodes.length; i <= l; ) {
					nodes[i++] = matchTemplate()
					nodes[i++] = new Text()
				}

				for (i = nodeCount - 1; i > l; ) nodes[i--].remove()
				if (nodeCount <= l) container.append(...nodes.slice(nodeCount, l + 1))

				// Diffing from bottom to top as well should be better
				let prevEnd = 0
				for (i = 0; i < l; ++i) {
					const [start, end] = matchPositions[i / 2]
					const before = value.slice(prevEnd, start)
					const match = value.slice(start, (prevEnd = end))

					if (before != nodeValues[i]) (<Text>nodes[i]).data = nodeValues[i] = before
					if (match != nodeValues[++i]) (<Text>nodes[i].firstChild).data = nodeValues[i] = match
				}

				;(<Text>nodes[l]).data = nodeValues[l] = value.slice(prevEnd)
				if (!container.parentNode) editor.overlays.append(container)
				nodeCount = l + 1
			} else stopSearch()
		},
		container,
		get regex() {
			return regex
		},
		matches: matchPositions,
		stopSearch,
	}
}

export { createSearchAPI, searchTemplate, matchTemplate }
