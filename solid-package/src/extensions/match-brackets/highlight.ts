import { createEffect, onCleanup } from "solid-js"
import { Extension } from "../../types"
import { Bracket } from "."
import { getClosestToken } from "../../utils"

export const highlightBracketPairs = (): Extension => editor => {
	let els: HTMLSpanElement[] = []
	let toggleActive = (add?: boolean) =>
		els.forEach(el => el.classList.toggle("active-bracket", !!add))

	createEffect<Bracket | undefined>(prev => {
		let [start, end] = editor.selection()
		let newId = -1
		let matcher = editor.extensions.matchBrackets

		if (matcher) {
			let { brackets, pairs } = matcher
			if (editor.focused() && start == end)
				for (let i = 0, bracket: Bracket; (bracket = brackets[++i]); ) {
					if (!bracket[4] && bracket[5] >= end && brackets[pairs[i]!]?.[1] <= end) {
						newId = i
						break
					}
				}

			let opening = brackets[pairs[newId]!]
			let closing = brackets[newId]
			if (closing != prev) {
				toggleActive()
				if (closing) {
					els[0] = getClosestToken(editor, ".punctuation", 0, -1, opening[1])!
					els[1] = getClosestToken(editor, ".punctuation", 0, -1, closing[1])!

					if (els[0] != els[1] && opening[1] + opening[3].length == closing[1]) {
						els[0].textContent += els[1].textContent!
						els[1].textContent = ""
						els[1] = els[0]
					}
					toggleActive(true)
				} else els = []
			}
			return brackets[newId]
		}
	})

	onCleanup(toggleActive)
}
