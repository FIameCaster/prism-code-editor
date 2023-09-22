import { regexEscape } from "../../utils"
import { createTemplate } from "../../core"
import { PrismEditor } from "../../types"

const template = createTemplate(
	"",
	"color:#0000;display:none;contain:strict;padding:0 var(--padding-inline,.75em) 0 var(--padding-left);",
)

export interface SearchAPI {
	/**
	 * Unhides the search container and highlights all matches of the specified string in the editor.
	 * @param str String to search for.
	 * @param caseSensitive Whether or not the search is case sensetive.
	 * @param wholeWord Whether or not matches must be surrounded by word boundries (\b).
	 * @param useRegExp If false, special characters will be escaped when creating the RegExp.
	 * @param selection Boundries to search between. If excluded, all the code is searched.
	 * @param excludedPosition A match containing this position in the string will be excluded.
	 * @returns An error message if the RegExp was invalid.
	 */
	search(
		str: string,
		caseSensitive?: boolean,
		wholeWordh?: boolean,
		useRegExp?: boolean,
		selection?: [number, number],
		excludedPosition?: number,
	): string | void
	/** Container that all the match results are appended to. */
	readonly container: HTMLDivElement
	/** Current regex used for searching. */
	readonly regex: RegExp
	/** Array of the positions of all the matches. */
	readonly matches: [number, number][]
	/** Hides the search container and removes all the matches. */
	stopSearch(): void
}

const createSearchAPI = (editor: PrismEditor): SearchAPI => {
	const span = document.createElement("span"),
		nodes: ChildNode[] = [new Text()],
		nodeValues: string[] = [],
		container = <HTMLDivElement>template.cloneNode(),
		stopSearch = () => {
			if (matchPositions[0]) {
				matchPositions = []
				container.style.display = "none"
			}
		}

	let matchPositions: [number, number][] = []
	let regex: RegExp
	span.append("")
	editor.overlays.append(container)

	return {
		search(str, caseSensitive, wholeWord, useRegExp, selection, excludedPosition = -1) {
			if (!str) return stopSearch()
			if (!useRegExp) str = regexEscape(str)
			const value = editor.value,
				searchStr = selection ? value.slice(...selection) : value,
				offset = selection?.[0] || 0,
				flags = `gu${caseSensitive ? "" : "i"}`

			try {
				matchPositions = []
				regex = RegExp(str, flags)
				// Reassigning the regex means error messages won't include the lookbehind or lookahead
				if (wholeWord)
					regex = RegExp(
						supportsLookbehind ? `(?<=^|\\b|\\W)${str}(?=\\b|\\W|$)` : `\\b${str}\\b`,
						flags,
					)
				for (
					let match: RegExpExecArray | null, l: number, index: number, i = 0;
					(match = regex.exec(searchStr));

				) {
					;(l = match[0].length) || regex.lastIndex++
					if ((index = match.index) > excludedPosition || index + l <= excludedPosition)
						matchPositions[i++] = [index + offset, index + l + offset]
				}
			} catch (e) {
				return (<Error>e).message
			} finally {
				const l = Math.min(matchPositions.length * 2, 20000),
					nodeCount = container.childNodes.length,
					remainder = value.slice(l ? matchPositions[l / 2 - 1][1] : 0)

				for (let i = nodes.length; i <= l; ) {
					nodes[i++] = <HTMLSpanElement>span.cloneNode(true)
					nodes[i++] = new Text()
				}

				for (let i = container.childNodes.length - 1; i > l; ) nodes[i--].remove()
				if (nodeCount <= l) container.append(...nodes.slice(nodeCount, l + 1))

				// Diffing from bottom to top as well should be better
				for (let i = 0, prevEnd = 0; i < l; ++i) {
					const [start, end] = matchPositions[i / 2],
						before = value.slice(prevEnd, start),
						match = value.slice(start, (prevEnd = end))

					if (before != nodeValues[i]) (<Text>nodes[i]).data = nodeValues[i] = before
					if (match != nodeValues[++i]) (<Text>nodes[i].firstChild).data = nodeValues[i] = match
				}

				if (remainder != nodeValues[l]) (<Text>nodes[l]).data = nodeValues[l] = remainder
				container.style.display = ""
			}
		},
		container,
		get regex() {
			return regex
		},
		get matches() {
			return matchPositions
		},
		stopSearch,
	}
}

template.setAttribute("aria-hidden", <any>true)

let supportsLookbehind: boolean
try {
	RegExp("(?<=)")
	supportsLookbehind = true
} catch {}

export { createSearchAPI }
