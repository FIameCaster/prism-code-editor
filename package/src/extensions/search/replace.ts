import { PrismEditor } from "../../index.js"
import { insertText } from "../../utils/index.js"
import { scrollToEl } from "../../utils/local.js"
import { SearchAPI, createSearchAPI } from "./search.js"
import { addTextareaListener } from "../../core.js"

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
	const getSelection = editor.getSelection
	const search = createSearchAPI(editor)
	const container = search.container
	const matches = search.matches
	const closest = () => {
		const caretPos = getSelection()[0]
		const l = matches.length
		for (let i = l; i; ) {
			if (caretPos > matches[--i][1]) return i == l - 1 ? 0 : i + 1
		}
		return l ? 0 : -1
	}

	const toggleClasses = () => {
		currentLine?.classList.toggle("match-highlight")
		currentMatch?.classList.toggle("match")
	}

	const removeSelection = () => {
		if (hasSelected) {
			toggleClasses()
			hasSelected = false
		}
	}

	let currentLine: HTMLDivElement
	let currentMatch: HTMLSpanElement
	let hasSelected = false

	addTextareaListener(editor, "focus", removeSelection)

	return Object.assign(search, {
		next() {
			const cursor = getSelection()[1]
			const l = matches.length
			for (let i = 0, match: [number, number]; i < l; i++) {
				match = matches[i]
				if (match[0] - <any>(match[0] == match[1]) >= cursor) return i
			}
			return l ? 0 : -1
		},
		prev() {
			const cursor = getSelection()[0]
			const l = matches.length
			for (let i = l, match: [number, number]; i; ) {
				match = matches[--i]
				if (match[1] + <any>(match[0] == match[1]) <= cursor) return i
			}
			return l - 1
		},
		closest,
		selectMatch(index: number, scrollPadding?: number) {
			removeSelection()
			if (matches[index]) {
				editor.setSelection(...matches[index])
				currentLine = editor.activeLine!
				currentMatch = <HTMLSpanElement>container.children[index]
				hasSelected = true
				toggleClasses()
				if (currentMatch) {
					scrollToEl(editor, currentMatch, scrollPadding)
				}
			}
		},
		replace(str: string) {
			if (matches[0]) {
				const index = closest()
				const [start, end] = matches[index]
				const [caretStart, caretEnd] = getSelection()

				if (start != caretStart || end != caretEnd) {
					this.selectMatch(index)
					return index
				}
				insertText(editor, str)
			}
		},
		replaceAll(str: string) {
			if (!matches[0]) return
			let value = editor.value
			let [start, end] = getSelection()
			let newLen = str.length
			let newStart = start
			let newEnd = end
			let newValue = ""
			let l = matches.length

			for (let i = 0; i < l; i++) {
				const [matchStart, matchEnd] = matches[i]
				const lengthDiff = newLen - matchEnd + matchStart
				const move = (pos: number) =>
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

			insertText(editor, newValue, matches[0][0], matches[l - 1][1], newStart, newEnd)
		},
		destroy() {
			editor.textarea.removeEventListener("focus", removeSelection)
			removeSelection()
			container.remove()
		},
	})
}

export { createReplaceAPI }
