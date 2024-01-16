/** @module commands */

import { EditorOptions, InputSelection, SetupExtension } from ".."
import { ignoreTab, isMac, preventDefault, setIgnoreTab, languageMap } from "../core"
import {
	getLanguage,
	insertText,
	getLineBefore,
	getLines,
	regexEscape,
	getModifierCode,
} from "../utils"

const clipboard = navigator.clipboard
const mod = isMac ? 4 : 2

/**
 * Extension that will add automatic indentation, closing of brackets,
 * quotes and tags along with the following commands:
 *
 * - Alt+ArrowUp/Down: Move line up/down
 * - Shift+Alt+ArrowUp/Down: Copy line up/down
 * - Ctrl+Enter (Cmd+Enter on MacOS): Insert blank line
 * - Ctrl+[ (Cmd+[ on MacOS): Outdent line
 * - Ctrl+] (Cmd+] on MacOS): Indent line
 * - Shift+Ctrl+K (Shift+Cmd + K on MacOS): Delete line
 * - Ctrl+/ (Cmd+/ on MacOS): Toggle comment
 * - Shift+Alt+A: Toggle block comment
 * - Ctrl+M (Ctrl+Shift+M on MacOS): Toggle Tab capturing
 * @param selfClosePairs Pairs of self-closing brackets and quotes.
 * Must be an array of strings with 2 characters each.
 * Defaults to `['""', "''", '``', '()', '[]', '{}']`.
 * @param selfCloseRegex Regex controlling whether or not a bracket/quote should
 * automatically close based on the character before and after the cursor.
 * Defaults to ``/([^\w$'"`]["'`]|.[[({])[;:,.\])}>\s]|.[[({]`/s``.
 */
export const defaultCommands =
	(
		selfClosePairs = ['""', "''", "``", "()", "[]", "{}"],
		selfCloseRegex = /([^\w$'"`]["'`]|.[[({])[;:,.\])}>\s]|.[[({]`/s,
	): SetupExtension =>
	(editor, options) => {
		let prevCopy: string
		const { textarea, keyCommandMap, inputCommandMap, getSelection } = editor

		const getIndent = ({ insertSpaces = true, tabSize }: EditorOptions) =>
			[insertSpaces ? " " : "\t", insertSpaces ? tabSize || 2 : 1] as const

		const scroll = (): true => !editor.extensions.cursor?.scrollIntoView()

		/**
		 * Automatically closes quotes and brackets if text is selected,
		 * or if the character before and after the cursor matches a regex
		 * @param wrapOnly If true, the character will only be closed if text is selected.
		 */
		const selfClose = (
			[start, end]: InputSelection,
			[open, close]: string,
			value: string,
			wrapOnly?: boolean,
		) =>
			(start < end ||
				(!wrapOnly && selfCloseRegex.test((value[end - 1] || " ") + open + (value[end] || " ")))) &&
			!insertText(editor, open + value.slice(start, end) + close, null, null, start + 1, end + 1)!

		const skipIfEqual = ([start, end]: InputSelection, char: string, value: string) =>
			start == end && value[end] == char && !editor.setSelection(start + 1)!

		/**
		 * Inserts slightly altered lines while keeping the same selection.
		 * Used when toggling comments and indenting.
		 */
		const insertLines = (
			old: string[],
			newL: string[],
			start: number,
			end: number,
			selectionStart: number,
			selectionEnd: number,
		) => {
			let newLines = newL.join("\n")
			if (newLines != old.join("\n")) {
				const last = old.length - 1
				const lastLine = newL[last]
				const oldLastLine = old[last]
				const lastDiff = oldLastLine.length - lastLine.length
				const firstDiff = newL[0].length - old[0].length
				const firstInsersion = start + (firstDiff < 0 ? newL : old)[0].search(/\S|$/)
				const lastInsersion =
					end - oldLastLine.length + (lastDiff > 0 ? lastLine : oldLastLine).search(/\S|$/)
				const offset = start - end + newLines.length + lastDiff
				const newCursorStart =
					firstInsersion > selectionStart
						? selectionStart
						: Math.max(firstInsersion, selectionStart + firstDiff)
				const newCursorEnd = selectionEnd + start - end + newLines.length
				insertText(
					editor,
					newLines,
					start,
					end,
					newCursorStart,
					selectionEnd < lastInsersion
						? newCursorEnd + lastDiff
						: Math.max(lastInsersion + offset, newCursorEnd),
				)
			}
		}

		const indent = (
			outdent: boolean,
			lines: string[],
			start1: number,
			end1: number,
			start: number,
			end: number,
			indentChar: string,
			tabSize: number,
		) => {
			insertLines(
				lines,
				lines.map(
					outdent
						? str => str.slice(str.search(/\S|$/) ? tabSize - (str.search(/\S|$/) % tabSize) : 0)
						: str => str && indentChar.repeat(tabSize - (str.search(/\S|$/) % tabSize)) + str,
				),
				start1,
				end1,
				start,
				end,
			)
		}

		inputCommandMap["<"] = (_e, selection, value) => selfClose(selection, "<>", value, true)

		selfClosePairs.forEach(([open, close]) => {
			const isQuote = open == close
			inputCommandMap[open] = (_e, selection, value) =>
				((isQuote && skipIfEqual(selection, close, value)) ||
					selfClose(selection, open + close, value)) &&
				scroll()
			if (!isQuote)
				inputCommandMap[close] = (_e, selection, value) =>
					skipIfEqual(selection, close, value) && scroll()
		})

		inputCommandMap[">"] = (e, selection, value) => {
			const closingTag = languageMap[getLanguage(editor)]?.autoCloseTags?.call(
				editor,
				selection,
				value,
			)
			if (closingTag) {
				insertText(editor, ">" + closingTag, null, null, selection[0] + 1)
				preventDefault(e)
			}
		}

		keyCommandMap.Tab = (e, [start, end], value) => {
			if (ignoreTab || options.readOnly || getModifierCode(e) & 6) return
			const [indentChar, tabSize] = getIndent(options)
			const shiftKey = e.shiftKey
			const [lines, start1, end1] = getLines(value, start, end)
			if (start < end || shiftKey) {
				indent(shiftKey, lines, start1, end1, start, end, indentChar, tabSize)
			} else insertText(editor, indentChar.repeat(tabSize - ((start - start1) % tabSize)))
			return scroll()
		}

		keyCommandMap.Enter = (e, selection, value) => {
			const code = getModifierCode(e) & 7
			if (!code || code == mod) {
				if (code) selection = <any>Array(2).fill(getLines(value, selection[1], selection[1])[2])
				const [indentChar, tabSize] = getIndent(options),
					autoIndent = languageMap[getLanguage(editor)]?.autoIndent,
					indenationCount =
						Math.floor(getLineBefore(value, selection[0]).search(/\S|$/) / tabSize) * tabSize,
					extraIndent = autoIndent?.[0]?.call(editor, selection, value) ? tabSize : 0,
					extraLine = autoIndent?.[1]?.call(editor, selection, value),
					newText =
						"\n" +
						indentChar.repeat(indenationCount + extraIndent) +
						(extraLine ? "\n" + indentChar.repeat(indenationCount) : "")

				if (newText[1] || selection[1] < value.length) {
					insertText(
						editor,
						newText,
						selection[0],
						selection[1],
						selection[0] + indenationCount + extraIndent + 1,
					)
					return scroll()
				}
			}
		}

		keyCommandMap.Backspace = (_e, [start, end], value) => {
			if (start == end) {
				const currentLine = getLineBefore(value, start),
					[, tabSize] = getIndent(options),
					isPair = selfClosePairs.includes(value.slice(start - 1, start + 1)),
					indenationCount = currentLine.length % tabSize || tabSize

				if (isPair || (indenationCount != 1 && !/\S|^$/.test(currentLine))) {
					insertText(editor, "", start - (isPair ? 1 : indenationCount), start + +isPair)
					return scroll()
				}
			}
		}

		for (let i = 0; i < 2; i++)
			keyCommandMap[i ? "ArrowDown" : "ArrowUp"] = (e, [start, end], value) => {
				const code = getModifierCode(e)
				if ((code & 0b111) == 1) {
					if (code == 1) {
						// Moving lines
						const newStart = i ? start : value.lastIndexOf("\n", start - 1)
						const newEnd = i ? value.indexOf("\n", end) + 1 : end
						if (newStart > -1 && newEnd > 0) {
							const [lines, start1, end1] = getLines(value, newStart, newEnd),
								line = lines[i ? "pop" : "shift"]()!,
								offset = line.length + 1

							lines[i ? "unshift" : "push"](line)
							insertText(
								editor,
								lines.join("\n"),
								start1,
								end1,
								start + (i ? offset : -offset),
								end + (i ? offset : -offset),
							)
						}
					} else {
						// Copying lines
						const [lines, start1, end1] = getLines(value, start, end)
						const str = lines.join("\n"),
							offset = i ? str.length + 1 : 0
						insertText(editor, str + "\n" + str, start1, end1, start + offset, end + offset)
					}
					return scroll()
				}
			}

		textarea.addEventListener("keydown", e => {
			const code = getModifierCode(e),
				keyCode = e.keyCode

			if (code == mod && (keyCode == 221 || keyCode == 219)) {
				const [start, end] = getSelection()
				indent(
					keyCode == 219,
					...getLines(editor.value, start, end),
					start,
					end,
					...getIndent(options),
				)
			} else if (code == (isMac ? 0b1010 : 0b0010) && keyCode == 77) {
				setIgnoreTab(!ignoreTab)
				preventDefault(e)
			} else if ((e.code == "Backslash" && code == mod) || (keyCode == 65 && code == 9)) {
				const value = editor.value,
					isBlock = code == 9,
					[start, end] = getSelection(),
					position = isBlock ? start : value.lastIndexOf("\n", start - 1) + 1,
					language = languageMap[getLanguage(editor, position)] || {},
					{ line, block } =
						language.getComments?.(editor, position, value) || language.comments || {},
					[lines, start1, end1] = getLines(value, start, end),
					last = lines.length - 1

				if (isBlock) {
					if (block) {
						const [open, close] = block,
							text = value.slice(start, end),
							pos = value.slice(0, start).search(regexEscape(open) + " ?$"),
							matches = RegExp("^ ?" + regexEscape(close)).test(value.slice(end))

						if (pos + 1 && matches)
							insertText(
								editor,
								text,
								pos,
								end + +(value[end] == " ") + close.length,
								pos,
								pos + end - start,
							)
						else
							insertText(
								editor,
								`${open} ${text} ${close}`,
								start,
								end,
								start + open.length + 1,
								end + open.length + 1,
							)
						scroll()
					}
				} else {
					if (line) {
						const escaped = regexEscape(line),
							regex = RegExp(`^\\s*(${escaped} ?|$)`),
							regex2 = RegExp(escaped + " ?"),
							allWhiteSpace = !/\S/.test(value.slice(start1, end1)),
							newLines = lines.map(
								lines.every(line => regex.test(line)) && !allWhiteSpace
									? str => str.replace(regex2, "")
									: str =>
											allWhiteSpace || /\S/.test(str) ? str.replace(/^\s*/, `$&${line} `) : str,
							)
						insertLines(lines, newLines, start1, end1, start, end)
						scroll()
					} else if (block) {
						const [open, close] = block,
							insertionPoint = lines[0].search(/\S|$/),
							hasComment = lines[0].startsWith(open, insertionPoint) && lines[last].endsWith(close),
							newLines = lines.slice()

						newLines[0] = lines[0].replace(
							hasComment ? RegExp(regexEscape(open) + " ?") : /(?=\S)|$/,
							hasComment ? "" : open + " ",
						)
						let diff = newLines[0].length - lines[0].length
						newLines[last] = hasComment
							? newLines[last].replace(RegExp(`( ?${regexEscape(close)})?$`), "")
							: newLines[last] + " " + close

						let newText = newLines.join("\n")
						let firstInsersion = insertionPoint + start1
						let newStart = firstInsersion > start ? start : Math.max(start + diff, firstInsersion)
						let newEnd =
							firstInsersion > end - <any>(start != end)
								? end
								: Math.min(Math.max(firstInsersion, end + diff), start1 + newText.length)
						insertText(editor, newText, start1, end1, newStart, Math.max(newStart, newEnd))
						scroll()
					}
				}
			} else if (code == 8 + mod && keyCode == 75) {
				const value = editor.value,
					[start, end, dir] = getSelection(),
					[lines, start1, end1] = getLines(value, start, end),
					column = dir == "forward" ? end - end1 + lines.pop()!.length : start - start1,
					newLineLen = getLines(value, end1 + 1)[0][0].length
				insertText(
					editor,
					"",
					start1 - <any>!!start1,
					end1 + <any>!start1,
					start1 + Math.min(column, newLineLen),
				)
				scroll()
			}
		})
		;(["copy", "cut", "paste"] as const).forEach(type =>
			textarea.addEventListener(type, e => {
				const [start, end] = getSelection()
				if (start == end && clipboard) {
					const [[line], start1, end1] = getLines(editor.value, start, end)
					if (type == "paste") {
						if (e.clipboardData!.getData("text/plain") == prevCopy) {
							insertText(editor, prevCopy + "\n", start1, start1, start + prevCopy.length + 1)
							scroll()
							preventDefault(e)
						}
					} else {
						clipboard.writeText((prevCopy = line))
						if (type == "cut") insertText(editor, "", start1, end1 + 1), scroll()
						preventDefault(e)
					}
				}
			}),
		)
	}
