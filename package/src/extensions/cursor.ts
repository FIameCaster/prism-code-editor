/** @module cursor */

import { BasicExtension, InputSelection, PrismEditor } from "../index.js"
import { createTemplate } from "../core.js"
import { getLineBefore } from "../utils/index.js"
import { addTextareaListener, scrollToEl } from "../utils/local.js"
import { defaultCommands } from "./commands.js"

/** Postion of the cursor relative to the editors overlays. */
export type CursorPosition = {
	top: number
	bottom: number
	left: number
	right: number
	height: number
}

export interface Cursor extends BasicExtension {
	/** Gets the cursor position relative to the editor overlays. */
	getPosition(): CursorPosition
	/** Scrolls the cursor into view. */
	scrollIntoView(): void
	/** The empty span element representing the cursor. */
	element: HTMLSpanElement
}

const cursorTemplate = createTemplate(
	" <span></span> ",
	"position:absolute;top:0;opacity:0;padding:inherit",
)

/**
 * Extension which can be used to calculate the position of the cursor and scroll it into view.
 * This is used by the {@link defaultCommands} extension to keep the cursor in view while typing.
 */
export const cursorPosition = () => {
	let cEditor: PrismEditor,
		prevBefore = " ",
		prevAfter = " "

	const cursorContainer = <HTMLDivElement>cursorTemplate.cloneNode(true),
		[before, cursor, after] = <[Text, HTMLSpanElement, Text]>(<unknown>cursorContainer.childNodes),
		selectionChange = ([start, end, direction]: InputSelection) => {
			let { value, activeLine } = cEditor,
				position = direction == "backward" ? start : end,
				newBefore = getLineBefore(value, position),
				newAfter = /.*/.exec(value.slice(position))![0]

			if (!newBefore && !newAfter) newAfter = " "
			if (prevBefore != newBefore) before.data = prevBefore = newBefore
			if (prevAfter != newAfter) after.data = prevAfter = newAfter
			if (cursorContainer.parentNode != activeLine) activeLine.prepend(cursorContainer)
		},
		scrollIntoView = () => scrollToEl(cEditor, cursor)

	const self: Cursor = editor => {
		editor.addListener("selectionChange", selectionChange)
		cEditor = editor

		editor.extensions.cursor = self
		addTextareaListener(editor, "input", e => {
			if (/history/.test((<InputEvent>e).inputType)) scrollIntoView()
		})

		if (editor.activeLine) selectionChange(editor.getSelection())
	}

	self.getPosition = () => {
		const rect1 = cursor.getBoundingClientRect(),
			rect2 = cEditor.overlays.getBoundingClientRect()

		return {
			top: rect1.y - rect2.y,
			bottom: rect2.bottom - rect1.bottom,
			left: rect1.x - rect2.x,
			right: rect2.right - rect1.x,
			height: rect1.height,
		}
	}

	self.scrollIntoView = scrollIntoView
	self.element = cursor

	return self
}
