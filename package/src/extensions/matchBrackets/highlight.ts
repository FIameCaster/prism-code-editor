/** @module highlight-brackets */

import { Extension } from "../.."
import { Bracket, BracketMatcher } from "./"
import { getClosestToken } from "../../utils"

/**
 * Extension adding a `selectionChange` handler to highlight the closest bracket pair.
 *
 * You must to add a {@link BracketMatcher} to your editor for this extension to work.
 *
 * The `.active-bracket` CSS selector can be used to highlight the brackets.
 */
export const highlightBracketPairs = (): Extension => ({
	update(editor) {
		this.update = () => {}
		let matcher: BracketMatcher,
			activeID = -1,
			els: HTMLSpanElement[] = [],
			selectionChange = ([start, end] = editor.getSelection()) => {
				let newID =
					start == end && (matcher = editor.extensions.matchBrackets!) && editor.focused
						? closest(end) || -1
						: -1
				if (newID != activeID) {
					toggleActive()

					if (newID + 1) {
						els = [matcher.pairs[newID]!, newID].map(
							id => getClosestToken(editor, ".punctuation", 0, -1, matcher.brackets[id][1])!,
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
					let i = 0, { brackets, pairs } = matcher, bracket: Bracket;
					(bracket = brackets[++i]);

				) {
					if (!bracket[4] && bracket[1] > offset - 2 && brackets[pairs[i]!]?.[1] <= offset) {
						return i
					}
				}
			},
			toggleActive = (add?: boolean) =>
				els.forEach(el => el.classList.toggle("active-bracket", !!add)),
			add = addEventListener.bind(editor.textarea)

		add("blur", () => selectionChange())
		add("focus", () => selectionChange())
		editor.addListener("selectionChange", selectionChange)
		editor.addListener("update", () => {
			toggleActive()
			activeID = -1
		})
	},
})
