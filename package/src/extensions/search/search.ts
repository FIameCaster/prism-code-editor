import { escapeRegExp } from "../../utils"
import { createTemplate } from "../../core"
import { PrismEditor } from "../../types"

const template = createTemplate(
	"",
	"color:#0000;display:none;contain:strict;margin:0 var(--padding-inline) 0 var(--padding-left);"
)
// @ts-ignore
template.setAttribute("aria-hidden", true)

export type SearchAPI = ReturnType<typeof createSearchAPI>

const createSearchAPI = (editor: PrismEditor) => {
	const span = document.createElement("span"),
		nodes: ChildNode[] = [new Text()],
		nodeValues: string[] = [],
		container = <HTMLDivElement>template.cloneNode()

	let matchPositions: [number, number][] = []
	let regex: RegExp
	span.append("")
	editor.overlays.append(container)

	return {
		/**
		 * Unhides the search container and highlights all matches of the specified string in the editor.
		 * @param str String to search for.
		 * @param caseSensitive Whether or not the search is case sensetive.
		 * @param wholeWordSearch Whether or not matches must be surrounded by word boundries (\b).
		 * @param useRegExp If false, special characters will be escaped when creating the RegExp.
		 * @param selection boundries to search between. If excluded, all the code is searched.
		 * @param excludedPosition A match containing this position in the string will be excluded.
		 * @returns An error message if the RegExp was invalid.
		 */
		search(
			str: string,
			caseSensitive?: boolean,
			wholeWordSearch?: boolean,
			useRegExp?: boolean,
			selection?: [number, number],
			excludedPosition = -1
		) {
			if (!str) return this.stopSearch()
			if (!useRegExp) str = escapeRegExp(str)
			if (wholeWordSearch) str = `\\b${str}\\b`
			const value = editor.value,
				searchStr = selection ? value.slice(...selection) : value,
				offset = selection?.[0] || 0

			try {
				matchPositions = []
				regex = RegExp(str, `gu${caseSensitive ? "" : "i"}`)
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
				container.style.removeProperty("display")
			}
		},
		/** Container that all the match results are appended to. */
		container,
		/** Current regex used for searching. */
		get regex() {
			return regex
		},
		/** Array of the positions of all the matches. */
		get matches() {
			return matchPositions
		},
		/** Hides the search container and removes all the matches. */
		stopSearch() {
			if (matchPositions[0]) {
				matchPositions = []
				container.style.display = "none"
			}
		},
	}
}

export { createSearchAPI }
