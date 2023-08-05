import { PrismEditor } from "."
import { numLines, isChrome, isWebKit, setSelection } from "./core"

/** Escapes all special regex characters with a backslash and returns the escaped string */
const regexEscape = (str: string) => str.replace(/[$+?|.^*(){}[\]\\]/g, "\\$&")

/** Returns the string between the position and the last \n */
const getLineBefore = (text: string, position: number) =>
	text.slice(text.lastIndexOf("\n", position - 1) + 1, position)

/**
 * Returns all lines that are at least partially between start and end.
 * Also returns the start of the first line, and the end of the last line
 */
const getLines = (text: string, start: number, end: number) =>
	[
		text
			.slice(
				(start = text.lastIndexOf("\n", start - 1) + 1),
				(end = (end = text.indexOf("\n", end)) + 1 ? end : text.length),
			)
			.split("\n"),
		start,
		end,
	] as const

/**
 * Searches a full line for a token that matches a selector and includes selectionStart
 * within the specified margins. Tokens are searched in reverse document order which means
 * children are searched before their parents.
 * @param editor Editor you want to search in.
 * @param selector CSS selector for the tokens you want to search for.
 * @param marginLeft How far ahead of the token the cursor can be. Defaults to 0.
 * @param marginRight How far behind the token the cursor can be. Defaults to marginLeft.
 * @param position Position to search in. Defaults to `selectionStart`.
 * @returns A span element if one's found and null if not.
 * ```javascript
 * // This will return a string token if the cursor
 * // is at least 1 character inside a string token
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
		line = editor.wrapper.children[numLines(value, position)],
		tokens = <NodeListOf<HTMLSpanElement>>line.querySelectorAll(selector),
		range = new Range()
	range.setEndAfter(line)
	for (let i = tokens.length, token: HTMLSpanElement, len: number; i; ) {
		range.setStartAfter((token = tokens[--i]))
		len = range.toString().length
		if (len <= length + marginRight && len + token.textContent!.length >= length - marginLeft)
			return token
	}
	return null
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
 * @param start Index to start the insertion. Defaults to `selectionStart`.
 * @param end Index to end the insertion. Defaults to start if specified else `selectionEnd`.
 * @param newCursorStart New start position of the cursor. Defaults to the end of the inserted text.
 * @param newCursorEnd New end position of the cursor. Defaults to `newCursorStart`.
 */
const insertText = (
	editor: PrismEditor,
	text: string,
	start?: number | null,
	end?: number | null,
	newCursorStart?: number | null,
	newCursorEnd?: number | null,
) => {
	const { textarea, getSelection, value, focused } = editor

	if (textarea.readOnly) return
	focused || textarea.focus()
	const selection =
		newCursorStart != null
			? setSelection([newCursorStart, newCursorEnd ?? newCursorStart, getSelection()[2]])
			: 0
	if (start != null) textarea.setSelectionRange(start, end ?? start)

	// Only Safari dispatches a beforeinput event
	isWebKit || textarea.dispatchEvent(new InputEvent("beforeinput", { data: text }))

	// Inserting escaped HTML in Chrome and Safari instead for much better performance
	if (isChrome || isWebKit) {
		// Bug inserting new lines at the end if the editor ends with an empty line
		const avoidBug =
			isChrome && !value[getSelection()[1]] && /^$|\n$/.test(value) && /\n$/.test(text)
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

const scrollToEl = (editor: PrismEditor, el: Element, paddingTop = 0) => {
	editor.scrollContainer.style.scrollPaddingBlock =
		document.documentElement.style.scrollPaddingBlock = `${paddingTop}px ${
			isChrome ? Math.round(el.getBoundingClientRect().height - el.scrollHeight) : 0
		}px`

	el.scrollIntoView({ block: "nearest" })
	editor.scrollContainer.style.removeProperty("scroll-padding-block")
	document.documentElement.style.removeProperty("scroll-padding-block")
}

export {
	regexEscape,
	getLineBefore,
	getLines,
	getClosestToken,
	getLanguage,
	insertText,
	scrollToEl,
}
