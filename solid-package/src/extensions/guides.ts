import { createEffect } from "solid-js"
import { Extension } from "../types"
import { template as _template } from "solid-js/web"

const template = _template(
	"<div class=guide-indents style=left:var(--padding-left);bottom:auto;right:auto>\t",
)

const indentTemplate = _template(
	"<div style=width:1px;position:absolute;background:var(--bg-guide-indent)>",
)

/** Extension adding indent guides to an editor. Does not work with word wrap. */
const indentGuides = (): Extension => editor => {
	let tabSize: number
	let prevLength = 0
	let lineIndentMap: number[] = []
	let active: HTMLDivElement | undefined
	let prevValue = ""

	const container = template() as HTMLElement
	const lines: HTMLDivElement[] = []
	const indents: number[][] = []

	createEffect(() => {
		const value = editor.value
		const wordWrap = editor.props.wordWrap

		tabSize = editor.props.tabSize || 2
		// We don't need the selection, but want to subscribe to the signal
		editor.selection()

		if (!wordWrap && value != prevValue) {
			lineIndentMap = []
			const newIndents = getIndentGuides(value, tabSize)
			const l = newIndents.length

			for (let i = 0, prev: number[] = [], next = newIndents[0]; next; i++) {
				const style = (lines[i] ||= indentTemplate() as HTMLDivElement).style
				const [top, left, height] = next
				const old = indents[i]

				next = newIndents[i + 1]

				if (top != old?.[0]) style.top = top + "00%"
				if (left != old?.[1]) style.left = left + "00%"
				if (height != old?.[2]) style.height = height + "00%"

				const isSingleIndent = prev[0] != top && next?.[0] != top
				const isSingleOutdent =
					prev[0] + prev[1] != top + height && next?.[0] + next?.[1] != top + height

				for (let j = -isSingleIndent, l = height + (isSingleOutdent as any); j < l; j++)
					lineIndentMap[j + top] = i

				prev = indents[i] = newIndents[i]
			}

			for (let i = l; i < prevLength; ) lines[i++].remove()
			container.append(...lines.slice(prevLength, (prevLength = l)))
		}

		const newActive = lines[lineIndentMap[editor.activeLine - 1]]

		if (newActive != active) {
			if (active) active.className = ""
			if (newActive) newActive.className = "active-indent"
			active = newActive
		}

		container.style.display = wordWrap ? "none" : ""
		prevValue = value
	})

	return container
}

/**
 * Calculates the position and height of indentation guides for a string of code.
 * @param code Code you want to calculate indentation lines for.
 * @param tabSize Number of spaces a tab is equal to.
 * @returns An array of indentation guides.
 * Each guide is a tuple containing 3 numbers with the following values:
 * - The starting line of the guide.
 * - How many tabs the guide is offset to the right.
 * - How many lines tall the guide is.
 */
const getIndentGuides = (code: string, tabSize: number) => {
	const lines = code.split("\n")
	const l = lines.length
	const stack: [number, number, number][] = []
	const results: [number, number, number][] = []

	for (let prevIndent = 0, emptyPos = -1, i = 0, p = 0; ; i++) {
		let last = i == l
		let line = lines[i]
		let pos = last ? 0 : line.search(/\S/)
		let indent = 0
		if (pos < 0) {
			if (emptyPos < 0) emptyPos = i
		} else {
			for (let i = 0; i < pos; ) {
				indent += line[i++] == "\t" ? tabSize - (indent % tabSize) : 1
			}
			if (indent) indent = Math.ceil(indent / tabSize)
			for (let j = indent; j < prevIndent; j++) {
				// Updating height of the closed lines
				stack[j][2] = (emptyPos < 0 || (j == indent && !last) ? i : emptyPos) - stack[j][0]
			}
			for (let j = prevIndent; j < indent; ) {
				// Adding new indentation lines
				results[p++] = stack[j] = [emptyPos < 0 || j > prevIndent ? i : emptyPos, j++, 0]
			}
			emptyPos = -1
			prevIndent = indent
		}
		if (last) break
	}
	return results
}

export { getIndentGuides, indentGuides }
