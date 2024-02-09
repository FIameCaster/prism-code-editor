import { InputSelection, PrismEditor } from ".."
import { numLines, isChrome, isWebKit, setSelection } from "../core"

/** Escapes all special regex characters with a backslash and returns the escaped string. */
const regexEscape = (str: string) => str.replace(/[$+?|.^*(){}[\]\\]/g, "\\$&")

/** Returns the string between the position and the last \n. */
const getLineBefore = (text: string, position: number) =>
	text.slice(text.lastIndexOf("\n", position - 1) + 1, position)

/**
 * Gets all lines that are at least partially between `start` and `end`
 * @param text Text to search in.
 * @param start Start of the selection.
 * @param end End of the selection. Defaults to `start`.
 */
const getLines = (text: string, start: number, end = start) =>
	[
		text
			.slice(
				(start = start ? text.lastIndexOf("\n", start - 1) + 1 : 0),
				(end = (end = text.indexOf("\n", end)) + 1 ? end : text.length),
			)
			.split("\n"),
		start,
		end,
	] as const

/**
 * Searches a full line for a token that matches a selector and contains `position`
 * within the specified margins. Tokens are searched in reverse document order which means
 * children are searched before their parents.
 * @param editor Editor you want to search in.
 * @param selector CSS selector for the tokens you want to search for.
 * @param marginLeft How far ahead of the token the cursor can be. Defaults to 0.
 * @param marginRight How far behind the token the cursor can be. Defaults to `marginLeft`.
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
	const value = editor.value,
		length = value.slice(position).search(/\n|$/) + 1,
		line = editor.wrapper.children[numLines(value, 0, position)],
		tokens = <NodeListOf<HTMLSpanElement>>line.querySelectorAll(selector),
		range = new Range()
	range.setEndAfter(line)
	for (let i = tokens.length, token: HTMLSpanElement, len: number; i; ) {
		range.setStartAfter((token = tokens[--i]))
		len = range.toString().length
		if (len <= length + marginRight && len + token.textContent!.length >= length - marginLeft)
			return token
	}
}

/**
 * Gets the current language at a position.
 * Useful if you want to run different logic based on language.
 * @param editor Editor to search in.
 * @param position Position to search in. Defaults to `selectionStart`.
 */
const getLanguage = (editor: PrismEditor, position?: number) =>
	getClosestToken(editor, '[class*="language-"]', 0, 0, position)?.className.match(
		/language-(\w+)/,
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
	{ textarea, getSelection, value, focused, options }: PrismEditor,
	text: string,
	start?: number | null,
	end?: number | null,
	newCursorStart?: number | null,
	newCursorEnd?: number | null,
) => {
	if (options.readOnly) return
	focused || textarea.focus()
	const selection: InputSelection | 0 =
		newCursorStart != null ? [newCursorStart, newCursorEnd ?? newCursorStart, getSelection()[2]] : 0
	if (start != null) textarea.setSelectionRange(start, end ?? start)

	// Bug inserting new lines at the end if the editor ends with an empty line
	const avoidBug = isChrome && !value[getSelection()[1]] && /^$|\n$/.test(value) && /\n$/.test(text)

	if (selection) setSelection(selection)

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
	if (selection) {
		textarea.setSelectionRange(...selection)
		setSelection()
	}
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
}
