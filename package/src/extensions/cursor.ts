/** @module cursor */

import { BasicExtension, InputSelection, PrismEditor } from "../index.js"
import { createTemplate, addTextareaListener } from "../core.js"
import { getLineBefore } from "../utils/index.js"
import { getLineEnd, scrollToEl } from "../utils/local.js"
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
	'<div style=position:absolute;top:0;opacity:0;padding:inherit> <span><span></span> ',
)

/**
 * Extension which can be used to calculate the position of the cursor and scroll it into view.
 * This is used by the {@link defaultCommands} extension to keep the cursor in view while typing.
 * 
 * The extension can also be accessed from `editor.extensions.cursor` when added.
 */
export const cursorPosition = () => {
	let cEditor: PrismEditor
	let prevBefore = " "
	let prevAfter = " "

	const cursorContainer = cursorTemplate()
	const [before, span] = <[Text, HTMLSpanElement]>(<unknown>cursorContainer.childNodes)
	const [cursor, after] = <[HTMLSpanElement, Text]>(<unknown>span.childNodes)
	const selectionChange = (selection: InputSelection) => {
		let { value, activeLine } = cEditor
		let position = selection[selection[2] < "f" ? 0 : 1]
		let newBefore = getLineBefore(value, position)
		let newAfter = value.slice(position, getLineEnd(value, position))

		if (!newBefore && !newAfter) newAfter = " "
		if (prevBefore != newBefore) before.data = prevBefore = newBefore
		if (prevAfter != newAfter) after.data = prevAfter = newAfter
		if (cursorContainer.parentNode != activeLine) activeLine.prepend(cursorContainer)
	}
	const scrollIntoView = () => scrollToEl(cEditor, cursor)

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
		const rect1 = cursor.getBoundingClientRect()
		const rect2 = cEditor.overlays.getBoundingClientRect()

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
