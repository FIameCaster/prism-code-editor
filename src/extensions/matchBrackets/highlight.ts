import { Extension, PrismEditor } from "../.."
import { Bracket, BracketMatcherNew, editorMatcherMap } from "./match"
import { getClosestToken } from "../../utils"

/**
 * Extension adding a `selectionChange` handler to highlight the closest bracket pair.
 *
 * You must to add a bracket matcher to your editor for this extension to work.
 *
 * The `.active-bracket` CSS selector can be used to highlight the brackets.
 */
export const highlightBracketPairs = (): Extension => {
	let initialized: boolean,
		matcher: BracketMatcherNew,
		cEditor: PrismEditor,
		activeID = -1,
		els: HTMLSpanElement[] = [],
		selectionChange = ([start, end] = cEditor.getSelection()) => {
			let newID =
				start == end && (matcher = editorMatcherMap.get(cEditor)!) && cEditor.focused
					? closest(end) || -1
					: -1
			if (newID != activeID) {
				toggleActive()

				if (newID + 1) {
					els = [matcher.pairs[newID]!, newID].map(
						id => getClosestToken(cEditor, ".punctuation", 0, -1, matcher.brackets[id][1])!,
					)
					if (els[0].nextSibling == els[1]) {
						els[0].textContent += els[1].textContent!
						els[1].textContent = ""
						els[1] = els[0]
					}
					toggleActive(true)
				} else els = []

				activeID = newID
			}
		},
		closest = (offset: number) => {
			for (
				let i = 0, brackets = matcher.brackets, pairs = matcher.pairs, bracket: Bracket;
				(bracket = brackets[++i]);

			) {
				if (!bracket[4] && bracket[1] > offset - 2 && brackets[pairs[i]!]?.[1] <= offset) {
					return i
				}
			}
		},
		toggleActive = (add?: boolean) =>
			els.forEach(el => el.classList.toggle("active-bracket", !!add))

	return {
		update(editor) {
			if (!initialized) {
				initialized = true
				cEditor = editor

				let add = addEventListener.bind(editor.textarea)

				add("blur", () => selectionChange())
				add("focus", () => selectionChange())
				editor.addListener("selectionChange", selectionChange)
				editor.addListener("update", () => {
					toggleActive()
					activeID = -1
				})
			}
		},
	}
}
