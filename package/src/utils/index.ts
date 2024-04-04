import { InputSelection, PrismEditor } from "../index.js"
import { numLines, isChrome, isWebKit } from "../core.js"
import { addListener, getLineEnd, getLineStart } from "./local.js"

let prevSelection: InputSelection | 0

/** Escapes all special regex characters with a backslash and returns the escaped string. */
const regexEscape = (str: string) => str.replace(/[$+?|.^*()[\]{}\\]/g, "\\$&")

/** Returns the string between the position and the previous \n. */
const getLineBefore = (text: string, position: number) =>
	text.slice(getLineStart(text, position), position)

/**
 * Gets all lines that are at least partially between `start` and `end`.
 * @param text Text to search in.
 * @param start Start of the selection.
 * @param end End of the selection. Defaults to `start`.
 * @returns A tuple containing an array of lines, the starting position of the first line,
 * and the ending position of the last line.
 */
const getLines = (text: string, start: number, end = start) =>
	[
		text.slice((start = getLineStart(text, start)), (end = getLineEnd(text, end))).split("\n"),
		start,
		end,
	] as const

/**
 * Searches a full line for a token that matches a selector and contains `position`
 * within the specified margins. Tokens are searched in reverse document order which means
 * children are searched before their parents.
 * @param editor Editor you want to search in.
 * @param selector CSS selector for the tokens you want to search for.
 * @param marginLeft How far to the left of the token the position can be. Defaults to 0.
 * @param marginRight How far to the right of the token the position can be. Defaults to `marginLeft`.
 * @param position Position to search in. Defaults to `selectionStart`.
 * @returns A span element if one's found or undefined if not.
 * @example
 * This will return a string token if the cursor
 * is at least 1 character inside a string token
 * ```javascript
 * getClosestToken(editor, '.string', -1)
 * ```
 */
const getClosestToken = (
	editor: PrismEditor,
	selector: string,
	marginLeft = 0,
	marginRight = marginLeft,
	position = editor.getSelection()[0],
) => {
	const value = editor.value
	const line = editor.wrapper.children[numLines(value, 0, position)]
	// We unfortunitely have to include elements, else we can't get empty tokens
	const walker = document.createTreeWalker(line, 5)

	let node = walker.lastChild()
	let offset = getLineEnd(value, position) + 1 - position - (<Text>node).length

	while (-offset <= marginRight && (node = walker.previousNode())) {
		if (node.lastChild) continue
		offset -= (<Text>node).length || 0

		if (offset <= marginLeft) {
			for (; node != line; node = node.parentNode!) {
				if ((<Element>node).matches?.(selector)) return <HTMLSpanElement>node
			}
		}
	}
}

/**
 * Gets the current language at a position.
 * Useful if you want to run different logic based on the language.
 * @param editor Editor to search in.
 * @param position Position to search in. Defaults to `selectionStart`.
 */
const getLanguage = (editor: PrismEditor, position?: number) =>
	getClosestToken(editor, '[class*="language-"]', 0, 0, position)?.className.match(
		/language-(\S*)/,
	)![1] || editor.options.language

/**
 * Inserts text into the editor (unless it's read-only) while keeping undo/redo history.
 * Focuses the `textarea` if it isn't already.
 * @param editor Target editor.
 * @param text Text to insert.
 * @param start Position to start the insertion. Defaults to `selectionStart`.
 * @param end Position to end the insertion. Defaults to `start` if specified, else `selectionEnd`.
 * @param newCursorStart New starting position for the cursor. Defaults to the end of the inserted text.
 * @param newCursorEnd New ending position for the cursor. Defaults to `newCursorStart`.
 */
const insertText = (
	editor: PrismEditor,
	text: string,
	start?: number | null,
	end?: number | null,
	newCursorStart?: number | null,
	newCursorEnd?: number | null,
) => {
	if (editor.options.readOnly) return
	prevSelection = editor.getSelection()
	end ??= start

	let textarea = editor.textarea
	let value = editor.value
	// Bug inserting new lines at the end if the editor ends with an empty line
	let avoidBug =
		isChrome && !value[end ?? prevSelection[1]] && /\n$/.test(text) && /^$|\n$/.test(value)
	let removeListener: () => any

	editor.focused || textarea.focus()
	if (start != null) textarea.setSelectionRange(start, end!)

	if (newCursorStart != null) {
		removeListener = addListener(editor, "update", () => {
			textarea.setSelectionRange(
				newCursorStart,
				newCursorEnd ?? newCursorStart,
				(<InputSelection>prevSelection)[2],
			)
			removeListener()
		})
	}

	// Only Safari dispatches a beforeinput event
	isWebKit || textarea.dispatchEvent(new InputEvent("beforeinput", { data: text }))

	// Inserting escaped HTML in Chrome and Safari instead for much better performance
	if (isChrome || isWebKit) {
		if (avoidBug) {
			// This means the last new line won't be inserted if there's
			// no selection, but that's less annoying than the bug.
			textarea.selectionEnd--
			text = text.slice(0, -1)
		}
		// New line at the end is always ignored in Safari
		if (isWebKit) text += "\n"
		document.execCommand(
			text ? "insertHTML" : "delete",
			false,
			text.replace(/&/g, "&amp;").replace(/</g, "&lt;"),
		)
		if (avoidBug) textarea.selectionStart++
	} else document.execCommand(text ? "insertText" : "delete", false, text)

	prevSelection = 0
}

/**
 * Returns a 4 bit integer where each bit represents whether
 * each modifier is pressed in the order Shift, Meta, Ctrl, Alt
 * ```javascript
 * e.altKey && e.ctrlKey && e.shiftKey && !e.metaKey
 * // is equivalent to
 * getModifierCode(e) == 0b1011
 * ```
 */
const getModifierCode = (
	e: KeyboardEvent, // @ts-expect-error
): number => e.altKey + e.ctrlKey * 2 + e.metaKey * 4 + e.shiftKey * 8

export {
	regexEscape,
	getLineBefore,
	getLines,
	getClosestToken,
	getLanguage,
	insertText,
	getModifierCode,
	prevSelection,
}
