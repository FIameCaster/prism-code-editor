import { EditorOptions, Extension, InputSelection } from ".."
import { ignoreTab, isMac, preventDefault, setIgnoreTab, languages } from "../core"
import { getLanguage, insertText, getLineBefore, getLines, regexEscape, getModifierCode } from "../utils"
import { Cursor } from "./cursor"

const clipboard = navigator.clipboard

/**
 * Extension that will add automatic indentation, closing of brackets,
 * quotes and tags, line- and block comment toggling and line moving/copying.
 * @param cursor Cursor that will be used to keep the cursor in view when typing.
 * @param selfClosePairs Pairs of self-closing brackets and quotes.
 * Must be an array of strings with 2 characters each.
 * Defaults to `['""', "''", '``', '()', '[]', '{}']`.
 * @param selfCloseRegex Regexp controlling whether or not a bracket/quote should
 * automatically close based on the character before and after the cursor.
 * Defaults to ``/([^\w$'"`]["'`]|.[[({])[,.\])}>\s]|.[[({]`/s``.
 */
export const defaultCommands = (
	cursor?: Cursor,
	selfClosePairs = ['""', "''", "``", "()", "[]", "{}"],
	selfCloseRegex = /([^\w$'"`]["'`]|.[[({])[,.\])}>\s]|.[[({]`/s,
): Extension => {
	let initialized: boolean, prevCopy: string

	return {
		update(editor, options) {
			if (initialized != (initialized = true)) {
				const { textarea, keyCommandMap, inputCommandMap, getSelection } = editor

				const getIndent = ({ insertSpaces = true, tabSize }: EditorOptions) =>
					[insertSpaces ? " " : "\t", insertSpaces ? tabSize || 2 : 1] as const

				const scroll = (): true => !cursor?.scrollIntoView()

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
					(start != end ||
						(!wrapOnly &&
							selfCloseRegex.test((value[end - 1] || " ") + open + (value[end] || " ")))) &&
					!insertText(
						editor,
						open + value.slice(start, end) + close,
						null,
						null,
						start + 1,
						end + 1,
					)!

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
					firstInsersion?: number,
					lastInsersion?: number,
				) => {
					const newLines = newL.join("\n"),
						last = old.length - 1,
						clamp = (num: number) => Math.max(start, Math.min(num, start + newLines.length))
					if (newLines != old.join("\n")) {
						firstInsersion ??= old[0].search(/\S|$/)
						lastInsersion ??= old[last].search(/\S|$/)
						insertText(
							editor,
							newLines,
							start,
							end,
							clamp(
								selectionStart +
									(selectionStart - start < firstInsersion ? 0 : newL[0].length - old[0].length),
							),
							clamp(
								selectionEnd +
									newLines.length -
									end +
									start -
									(old[last].length - end + selectionEnd < lastInsersion
										? newL[last].length - old[last].length
										: 0),
							),
						)
					}
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

				inputCommandMap[">"] = (_e, selection, value) => {
					const closingTag = languages[getLanguage(editor)]?.autoCloseTags?.call(
						editor,
						selection,
						value,
					)
					if (closingTag) {
						setTimeout(() => insertText(editor, closingTag, null, null, selection[0] + 1), 100)
					}
				}

				keyCommandMap.Tab = (e, [start, end], value) => {
					if (ignoreTab || e.ctrlKey || e.metaKey) return
					const [indentChar, tabSize] = getIndent(options)
					const shiftKey = e.shiftKey
					const [lines, start1, end1] = getLines(value, start, end)
					if (start == end && !shiftKey) {
						insertText(editor, indentChar.repeat(tabSize - ((start - start1) % tabSize)))
					} else
						insertLines(
							lines,
							lines.map(
								e.shiftKey
									? str =>
											str.slice(str.search(/\S|$/) ? tabSize - (str.search(/\S|$/) % tabSize) : 0)
									: str => str && indentChar.repeat(tabSize - (str.search(/\S|$/) % tabSize)) + str,
							),
							start1,
							end1,
							start,
							end,
						)
					return scroll()
				}

				keyCommandMap.Enter = (_e, selection, value) => {
					const [indentChar, tabSize] = getIndent(options),
						context = languages[getLanguage(editor)],
						autoIndent = context?.autoIndent,
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
							null,
							null,
							selection[0] + indenationCount + extraIndent + 1,
						)
						return scroll()
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

				editor.textarea.addEventListener("keydown", e => {
					const code = getModifierCode(e)

					if (code == (isMac ? 0b1010 : 0b0010) && e.keyCode == 77) {
						setIgnoreTab(!ignoreTab)
						preventDefault(e)
					} else if ((e.code == "Backslash" && code == 2) || (e.keyCode == 65 && code == 9)) {
						const value = editor.value,
							isBlock = code == 9,
							[start, end] = getSelection(),
							{ line, block } =
								languages[
									getLanguage(editor, isBlock ? start : value.lastIndexOf("\n", start - 1) + 1)
								]?.comments || {},
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
									hasComment =
										lines[0].startsWith(open, insertionPoint) && lines[last].endsWith(close),
									newLines = lines.slice()

								newLines[0] = lines[0].replace(
									hasComment ? RegExp(regexEscape(open) + " ?") : /(?=\S)|$/,
									hasComment ? "" : open + " ",
								)
								let diff =
									insertionPoint > start - start1 ? 0 : newLines[0].length - lines[0].length
								newLines[last] = newLines[last].replace(
									RegExp(`( ?${regexEscape(close)})?$`),
									hasComment ? "" : " " + close,
								)

								if (last)
									insertLines(lines, newLines, start1, end1, start, end, insertionPoint, Infinity)
								else
									insertText(
										editor,
										newLines[0],
										start1,
										end1,
										Math.max(start1, start + diff),
										Math.min(end + diff, start1 + newLines[0].length),
									)
								scroll()
							}
						}
					}
				})

				if (clipboard)
					(["copy", "cut", "paste"] as const).forEach(type =>
						textarea.addEventListener(type, e => {
							const [start, end] = getSelection()
							if (start == end) {
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
		},
	}
}
