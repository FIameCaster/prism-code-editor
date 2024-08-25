/** @module guides */

import { createTemplate } from "../core.js"
import { Extension, PrismEditor } from "../types.js"

const template = createTemplate(
	"<div class=guide-indents style=left:var(--padding-left);bottom:auto;right:auto> ",
)

const indentTemplate = createTemplate(
	"<div style=width:1px;position:absolute;background:var(--bg-guide-indent)>",
)

/** Extension adding indent guides to an editor. Does not work with word wrap. */
const indentGuides = (): Extension => {
	let tabSize: number
	let prevLength = 0
	let lineIndentMap: number[]
	let active = -1
	let currentEditor: PrismEditor

	const lines: HTMLDivElement[] = []
	const indents: number[][] = []
	const container = template()

	const update = (code: string) => {
		lineIndentMap = []
		const newIndents = getIndentGuides(code, tabSize)
		const l = newIndents.length

		for (let i = 0, prev: number[] = [], next = newIndents[0]; next; i++) {
			const style = (lines[i] ||= indentTemplate()).style
			const [top, height, left] = next
			const old = indents[i]

			next = newIndents[i + 1]

			if (top != old?.[0]) style.top = top + "00%"
			if (height != old?.[1]) style.height = height + "00%"
			if (left != old?.[2]) style.left = left * 100 + "%"

			const isSingleIndent = prev[0] != top && next?.[0] != top,
				isSingleOutdent = prev[0] + prev[1] != top + height && next?.[0] + next?.[1] != top + height

			for (let j = -isSingleIndent, l = height + <any>isSingleOutdent; j < l; j++)
				lineIndentMap[j + top] = i

			prev = indents[i] = newIndents[i]
		}

		for (let i = prevLength; i > l; ) lines[--i].remove()
		container.append(...lines.slice(prevLength, (prevLength = l)))
	}

	const updateActive = () => {
		const newActive = lineIndentMap[currentEditor.activeLine - 1] ?? -1

		if (newActive != active) {
			active > -1 && (lines[active].className = "")
			newActive > -1 && (lines[newActive].className = "active-indent")
		}
		active = newActive
	}

	return {
		update(editor, options) {
			if (!currentEditor) {
				currentEditor = editor
				editor.lines[0].append(container)
				editor.on("update", update)
				editor.on("selectionChange", updateActive)
			}
			container.style.display = options.wordWrap ? "none" : ""

			if (tabSize != (tabSize = options.tabSize || 2)) {
				update(editor.value)
				updateActive()
			}
		},
	}
}

/**
 * @param line Line you want to calculate the indentation level of.
 * @param tabSize Number of spaces a tab is equal to.
 * @returns Indentation level rounded up to the nearest number of tabs.
 * If the line doesn't contain any non-whitespace characters, -1 is returned.
 */
const getIndentLevel = (line: string, tabSize: number) => {
	let l = line.search(/\S/)
	let result = 0
	if (l < 0) return l
	for (let i = 0; i < l; ) {
		result += line[i++] == "\t" ? tabSize - (result % tabSize) : 1
	}
	return Math.ceil(result / tabSize)
}

/**
 * Calculates position and height of indentation guides for a string of code.
 * @param code Code you want to calculate indentation lines for.
 * @param tabSize Number of spaces a tab is equal to.
 * @returns An array of indetation guides.
 * Each guide is a tuple containing 3 numbers with the following values:
 * - The starting line of the guide.
 * - How many lines tall the guide is.
 * - How many spaces the guide is offset to the right.
 */
const getIndentGuides = (code: string, tabSize: number) => {
	const lines = code.split("\n")
	const l = lines.length
	const stack: [number, number, number][] = []
	const results: [number, number, number][] = []

	for (let prevIndent = 0, emptyPos = -1, i = 0, p = 0; ; i++) {
		const last = i == l
		const indent = last ? 0 : getIndentLevel(lines[i], tabSize)
		if (indent < 0) {
			if (emptyPos < 0) emptyPos = i
		} else {
			for (let j = indent; j < prevIndent; j++) {
				// Updating height of the closed lines
				stack[j][1] = (emptyPos < 0 || (j == indent && !last) ? i : emptyPos) - stack[j][0]
			}
			for (let j = prevIndent; j < indent; ) {
				// Adding new indentation lines
				results[p++] = stack[j] = [emptyPos < 0 || j > prevIndent ? i : emptyPos, 0, j++ * tabSize]
			}
			emptyPos = -1
			prevIndent = indent
		}
		if (last) break
	}
	return results
}

export { indentGuides, getIndentLevel, getIndentGuides }
