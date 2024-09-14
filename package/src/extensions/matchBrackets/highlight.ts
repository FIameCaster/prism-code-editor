/** @module highlight-brackets */

import { BasicExtension } from "../../index.js"
import { Bracket, BracketMatcher } from "./index.js"
import { getClosestToken } from "../../utils/index.js"
import { addTextareaListener } from "../../utils/local.js"

/**
 * Extension adding a `selectionChange` handler to highlight the closest bracket pair.
 *
 * You must to add a {@link BracketMatcher} to your editor for this extension to work.
 *
 * The `.active-bracket` CSS selector can be used to highlight the brackets.
 */
export const highlightBracketPairs = (): BasicExtension => editor => {
	let prev: Bracket
	let els: HTMLSpanElement[] = []
	let selectionChange = () => {
		let matcher = editor.extensions.matchBrackets
		let [start, end] = editor.getSelection()

		if (matcher) {
			let brackets = matcher.brackets
			let pairs = matcher.pairs
			let opening!: Bracket
			let closing!: Bracket
			if (editor.focused && start == end) {
				for (let i = 0, bracket: Bracket; (bracket = brackets[++i]); ) {
					if (!bracket[5] && bracket[2] >= end && brackets[pairs[i]!]?.[1] <= end) {
						opening = brackets[pairs[i]!]
						closing = bracket
						break
					}
				}
			}

			if (closing != prev) {
				toggleActive()
				if (closing) {
					els = [opening, closing].map(
						bracket => getClosestToken(editor, ".punctuation", 0, -1, bracket[1])!,
					)

					if (els[0] != els[1] && opening[2] == closing[1]) {
						els[0].textContent += els[1].textContent!
						els[1].textContent = ""
						els[1] = els[0]
					}
					toggleActive(true)
				} else els = []
			}
			prev = closing
		}
	}
	let toggleActive = (add?: boolean) =>
		els.forEach(el => el.classList.toggle("active-bracket", !!add))

	addTextareaListener(editor, "focus", selectionChange)
	addTextareaListener(editor, "blur", selectionChange)
	editor.on("selectionChange", selectionChange)
}
