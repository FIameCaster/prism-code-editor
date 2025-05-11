/** @module cursor */

import { BasicExtension, InputSelection, PrismEditor } from "../index.js"
import { createTemplate } from "../core.js"
import { getLineBefore } from "../utils/index.js"
import {
	getLineEnd,
	scrollToEl,
	addTextareaListener,
	getPosition,
	updateNode,
} from "../utils/local.js"
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

const cursorTemplate = /* @__PURE__ */ createTemplate(
	"<div style=position:absolute;top:0;opacity:0;padding-right:inherit> <span><span></span> ",
)

/**
 * Extension which can be used to calculate the position of the cursor and scroll it into view.
 * This is used by the {@link defaultCommands} extension to keep the cursor in view while typing.
 *
 * The extension can also be accessed from `editor.extensions.cursor` when added.
 */
export const cursorPosition = () => {
	let cEditor: PrismEditor

	const cursorContainer = cursorTemplate()
	const [before, span] = <[Text, HTMLSpanElement]>(<unknown>cursorContainer.childNodes)
	const [cursor, after] = <[HTMLSpanElement, Text]>(<unknown>span.childNodes)
	const selectionChange = (selection: InputSelection) => {
		const value = cEditor.value
		const activeLine = cEditor.lines[cEditor.activeLine]
		const position = selection[selection[2] < "f" ? 0 : 1]

		updateNode(before, getLineBefore(value, position))
		updateNode(after, value.slice(position, getLineEnd(value, position)) + "\n")
		if (cursorContainer.parentNode != activeLine) activeLine.prepend(cursorContainer)
	}
	const scrollIntoView = () => scrollToEl(cEditor, cursor)

	const self: Cursor = editor => {
		editor.on("selectionChange", selectionChange)
		cEditor = editor

		editor.extensions.cursor = self
		addTextareaListener(editor, "input", e => {
			if (/history/.test((<InputEvent>e).inputType)) scrollIntoView()
		})

		if (editor.activeLine) selectionChange(editor.getSelection())
	}

	self.getPosition = () => getPosition(cEditor, cursor)

	self.scrollIntoView = scrollIntoView
	self.element = cursor

	return self
}
