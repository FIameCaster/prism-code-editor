/** @module highlight-brackets */

import { BasicExtension } from "../../index.js"
import { Bracket, BracketMatcher } from "./index.js"
import { getClosestToken } from "../../utils/index.js"
import { addTextareaListener } from "../../core.js"

/**
 * Extension adding a `selectionChange` handler to highlight the closest bracket pair.
 *
 * You must to add a {@link BracketMatcher} to your editor for this extension to work.
 *
 * The `.active-bracket` CSS selector can be used to highlight the brackets.
 */
export const highlightBracketPairs = (): BasicExtension => editor => {
	let brackets: Bracket[],
		matcher: BracketMatcher | undefined,
		pairs: (number | undefined)[],
		activeID = -1,
		els: HTMLSpanElement[] = [],
		selectionChange = () => {
			matcher ||= editor.extensions.matchBrackets
			let [start, end] = editor.getSelection()
			let newID = start == end && editor.focused && matcher ? closest(end) || -1 : -1
			if (newID != activeID) {
				toggleActive()
				if (newID + 1) {
					let opening = brackets[pairs[newID]!]
					let closing = brackets[newID]
					els = [opening, closing].map(
						bracket => getClosestToken(editor, ".punctuation", 0, -1, bracket[1])!,
					)

					if (els[0] != els[1] && opening[1] + opening[3].length == closing[1]) {
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
			;({ brackets, pairs } = matcher!)
			for (let i = 0, bracket: Bracket; (bracket = brackets[++i]); ) {
				if (!bracket[4] && bracket[5] >= offset && brackets[pairs[i]!]?.[1] <= offset) {
					return i
				}
			}
		},
		toggleActive = (add?: boolean) =>
			els.forEach(el => el.classList.toggle("active-bracket", !!add))

	addTextareaListener(editor, "focus", selectionChange)
	addTextareaListener(editor, "blur", selectionChange)
	editor.addListener("selectionChange", selectionChange)
	editor.addListener("update", () => {
		toggleActive()
		activeID = -1
	})
}
