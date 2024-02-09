import { regexEscape } from "../../utils"
import { createTemplate } from "../../core"
import { PrismEditor } from "../../types"

const template = createTemplate(
	"",
	"color:#0000;display:none;contain:strict;padding:0 var(--_pse) 0 var(--padding-left);",
)

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
	const span = document.createElement("span"),
		nodes: ChildNode[] = [new Text()],
		nodeValues: string[] = [],
		container = <HTMLDivElement>template.cloneNode(),
		matchPositions: [number, number][] = [],
		stopSearch = () => {
			if (matchPositions[0]) {
				matchPositions.length = 0
				container.style.display = "none"
			}
		}

	let regex: RegExp
	let nodeCount = 0
	span.append("")
	editor.overlays.append(container)

	return {
		search(str, caseSensitive, wholeWord, useRegExp, selection, filter, pattern) {
			if (!str) return stopSearch()
			if (!useRegExp) str = regexEscape(str)
			const value = editor.value,
				searchStr = selection ? value.slice(...selection) : value,
				offset = selection ? selection[0] : 0

			let match: RegExpExecArray | null,
				l: number,
				index: number,
				i = 0

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

			if (!i) return stopSearch()
			matchPositions.length = i

			l = Math.min(i * 2, 20000)

			for (let i = nodes.length; i <= l; ) {
				nodes[i++] = <HTMLSpanElement>span.cloneNode(true)
				nodes[i++] = new Text()
			}

			for (let i = nodeCount - 1; i > l; ) nodes[i--].remove()
			if (nodeCount <= l) container.append(...nodes.slice(nodeCount, l + 1))

			// Diffing from bottom to top as well should be better
			for (let i = 0, prevEnd = 0; i < l; ++i) {
				const [start, end] = matchPositions[i / 2],
					before = value.slice(prevEnd, start),
					match = value.slice(start, (prevEnd = end))

				if (before != nodeValues[i]) (<Text>nodes[i]).data = nodeValues[i] = before
				if (match != nodeValues[++i]) (<Text>nodes[i].firstChild).data = nodeValues[i] = match
			}

			;(<Text>nodes[l]).data = nodeValues[l] = value.slice(matchPositions[l / 2 - 1][1])
			container.style.display = ""
			nodeCount = l + 1
		},
		container,
		get regex() {
			return regex
		},
		matches: matchPositions,
		stopSearch,
	}
}

template.setAttribute("aria-hidden", <any>true)

export { createSearchAPI }
