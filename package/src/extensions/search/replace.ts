import { PrismEditor } from "../.."
import { insertText, scrollToEl } from "../../utils"
import { SearchAPI, createSearchAPI } from "./search"

/**
 * Object with methods useful for performing a search
 * and both highlighting and replacing the matches.
 */
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
	 * If a match is selected, it's replaced with the specified value.
	 * If not, the closest match will be selected and the index is returned.
	 */
	replace(value: string): number | undefined
	/**
	 * @param value Value
	 * @param selection Does nothing. Kept for backwards compatibility.
	 */
	replaceAll(value: string, selection?: [number, number]): void
	/** Removes the highlight container from the DOM and all potential event listeners. */
	destroy(): void
}

/** Function adding both search and replace functionality to an editor. */
const createReplaceAPI = (editor: PrismEditor): ReplaceAPI => {
	const { getSelection, textarea } = editor,
		search = createSearchAPI(editor),
		closest = () => {
			const caretPos = getSelection()[0],
				matches = search.matches,
				l = matches.length
			for (let i = l; i; ) {
				if (caretPos > matches[--i][1]) return i == l - 1 ? 0 : i + 1
			}
			return l ? 0 : -1
		}

	let currentLine: HTMLDivElement,
		currentMatch: HTMLSpanElement,
		removeHighlight: (() => void) | null

	return Object.assign(search, {
		next() {
			const cursor = getSelection()[1],
				matches = search.matches,
				l = matches.length
			for (let i = 0, match: [number, number]; i < l; i++) {
				match = matches[i]
				if (match[0] - <any>(match[0] == match[1]) >= cursor) return i
			}
			return l ? 0 : -1
		},
		prev() {
			const cursor = getSelection()[0],
				matches = search.matches,
				l = matches.length
			for (let i = l, match: [number, number]; i; ) {
				match = matches[--i]
				if (match[1] + <any>(match[0] == match[1]) <= cursor) return i
			}
			return l - 1
		},
		closest,
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
				editor.setSelection(...match)
				textarea.addEventListener("focus", removeHighlight)
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
			const index = closest(),
				[start, end] = search.matches[index],
				[caretStart, caretEnd] = getSelection()

			if (start != caretStart || end != caretEnd) {
				this.selectMatch(index)
				return index
			}
			insertText(editor, str)
		},
		replaceAll(str: string) {
			const { matches } = search
			if (!matches[0]) return
			let value = editor.value,
				[start, end] = getSelection(),
				newLen = str.length,
				newStart = start,
				newEnd = end,
				newValue = "",
				l = matches.length

			for (let i = 0; i < l; i++) {
				const [matchStart, matchEnd] = matches[i],
					lengthDiff = newLen - matchEnd + matchStart,
					move = (pos: number) =>
						matchStart > pos
							? 0
							: pos >= matchEnd
							? lengthDiff
							: lengthDiff < 0 && pos > matchStart + newLen
							? newLen + matchStart - pos
							: 0

				newEnd += move(end)
				newStart += move(start)
				newValue += i ? value.slice(matches[i - 1][1], matchStart) + str : str
			}

			insertText(
				editor,
				newValue,
				matches[0][0],
				matches[l - 1][1],
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
