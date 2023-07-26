import { PrismEditor } from "../.."
import { insertText } from "../../utils"
import { createSearchAPI } from "./search"

export type ReplaceAPI = ReturnType<typeof createReplaceAPI>

const createReplaceAPI = (editor: PrismEditor) => {
	const { getSelection, textarea, scrollContainer } = editor,
		search = createSearchAPI(editor)

	let currentLine: HTMLDivElement,
		currentMatch: HTMLSpanElement,
		removeHighlight: (() => void) | null

	return Object.assign(search, {
		/** Index of the match ahead of the cursor. */
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
		/** Index of the match behind the cursor. */
		prev() {
			const caretPos = getSelection()[1],
				matches = search.matches,
				l = matches.length
			for (let i = l; i; ) {
				if (matches[--i][1] < caretPos) return i
			}
			return l - 1
		},
		/** Index of the closest match. */
		closest() {
			const caretPos = getSelection()[0],
				matches = search.matches,
				l = matches.length
			for (let i = l; i; ) {
				if (caretPos > matches[--i][1]) return i == l - 1 ? 0 : i + 1
			}
			return l ? 0 : -1
		},
		/** Selects the match with the passed index. */
		selectMatch(index: number, scrollPadding?: number) {
			removeHighlight?.()
			const match = search.matches[index]
			if (match) {
				editor.setSelection(...match)
				removeHighlight = () => {
					currentLine?.classList.remove("match-highlight")
					currentMatch?.classList.remove("match")
					textarea.removeEventListener("focus", removeHighlight!)
					removeHighlight = null
				}
				textarea.addEventListener("focus", removeHighlight)
				;(currentLine = editor.activeLine!).classList.add("match-highlight")
				;(currentMatch = <HTMLSpanElement>search.container.children[index])?.classList.add("match")
				if (scrollPadding) scrollContainer.style.scrollPaddingTop = scrollPadding + "px"
				currentMatch?.scrollIntoView({ block: "nearest" })
				scrollContainer.style.removeProperty("scroll-padding-top")
			}
		},
		/**
		 * If a match is selected, it's replaced with the specified string.
		 * If not, the closest match will be selected and the index is returned.
		 */
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
		/** Replaces all matches with the specified string. */
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
		/** Removes the highlight container from the DOM and all potential event listeners. */
		destroy() {
			removeHighlight?.()
			search.container.remove()
		},
	})
}

export { createReplaceAPI }
