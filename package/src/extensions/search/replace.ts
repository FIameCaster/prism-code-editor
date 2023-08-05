import { PrismEditor } from "../.."
import { insertText, scrollToEl } from "../../utils"
import { SearchAPI, createSearchAPI } from "./search"

export interface ReplaceAPI extends SearchAPI {
	/** Index of the match ahead of the cursor. */
	next(): number
	/** Index of the match behind the cursor. */
	prev(): number
	/** Index of the closest match. */
	closest(): number
	/**
	 * Selects the match with the passed index and scrolls
	 * it into view with the specified scroll padding.
	 */
	selectMatch(index: number, scrollPadding?: number): void
	/**
	 * If a match is selected, it's replaced with the specified string.
	 * If not, the closest match will be selected and the index is returned.
	 */
	replace(str: string): number | undefined
	/** Replaces all matches with the specified string. */
	replaceAll(str: string, selection?: [number, number]): void
	/** Removes the highlight container from the DOM and all potential event listeners. */
	destroy(): void
}

const createReplaceAPI = (editor: PrismEditor): ReplaceAPI => {
	const { getSelection, textarea } = editor,
		search = createSearchAPI(editor)

	let currentLine: HTMLDivElement,
		currentMatch: HTMLSpanElement,
		removeHighlight: (() => void) | null

	return Object.assign(search, {
		next() {
			const [start, end] = getSelection(),
				matches = search.matches,
				pos = end + +(start == end),
				l = matches.length
			for (let i = 0; i < l; i++) {
				if (matches[i][0] >= pos) return i
			}
			return l ? 0 : -1
		},
		prev() {
			const caretPos = getSelection()[1],
				matches = search.matches,
				l = matches.length
			for (let i = l; i; ) {
				if (matches[--i][1] < caretPos) return i
			}
			return l - 1
		},
		closest() {
			const caretPos = getSelection()[0],
				matches = search.matches,
				l = matches.length
			for (let i = l; i; ) {
				if (caretPos > matches[--i][1]) return i == l - 1 ? 0 : i + 1
			}
			return l ? 0 : -1
		},
		selectMatch(index: number, scrollPadding?: number) {
			removeHighlight?.()
			const match = search.matches[index]
			if (match) {
				removeHighlight = () => {
					currentLine?.classList.remove("match-highlight")
					currentMatch?.classList.remove("match")
					textarea.removeEventListener("focus", removeHighlight!)
					removeHighlight = null
				}
				textarea.addEventListener("focus", removeHighlight)
				editor.setSelection(...match)
				currentLine = editor.activeLine!
				currentLine.classList.add("match-highlight")
				currentMatch = <HTMLSpanElement>search.container.children[index]
				if (currentMatch) {
					currentMatch.classList.add("match")
					scrollToEl(editor, currentMatch, scrollPadding)
				}
			}
		},
		replace(str: string) {
			if (!search.matches[0]) return
			const index = this.closest(),
				[start, end] = search.matches[index],
				[caretStart, caretEnd] = getSelection()

			if (start == caretStart && end == caretEnd) insertText(editor, str)
			else {
				this.selectMatch(index)
				return index
			}
		},
		replaceAll(str: string, selection?: [number, number]) {
			const { matches, regex } = search
			if (!matches[0]) return
			let value = editor.value,
				[start, end] = getSelection(),
				newLen = str.length,
				newStart = start,
				newEnd = end,
				[searchStart, searchEnd] = selection || [0, value.length]

			for (let i = 0, l = matches.length; i < l; i++) {
				const [matchStart, matchEnd] = matches[i],
					lengthDiff = newLen - matchEnd + matchStart
				if (end <= matchStart) break

				newEnd +=
					end >= matchEnd
						? lengthDiff
						: lengthDiff < 0 && end > matchStart + newLen
						? newLen + matchStart - end
						: 0
				newStart +=
					start >= matchEnd
						? lengthDiff
						: lengthDiff < 0 && start > matchStart + newLen
						? newLen + matchStart - start
						: 0
			}

			insertText(
				editor,
				value.slice(searchStart, searchEnd).replace(regex, str),
				searchStart,
				searchEnd,
				newStart,
				newEnd,
			)
		},
		destroy() {
			removeHighlight?.()
			search.container.remove()
		},
	})
}

export { createReplaceAPI }
