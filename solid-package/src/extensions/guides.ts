import { createEffect } from "solid-js"
import { Extension } from "../types"
import { template as _template } from "solid-js/web"

const template = _template(
	"<div class=guide-indents style=left:var(--padding-left);bottom:auto;right:auto> ",
)

const indentTemplate = _template(
	"<div style=width:1px;position:absolute;background:var(--bg-guide-indent)>",
)

/** Extension adding indent guides to an editor. Does not work with word wrap. */
export const indentGuides = (): Extension => editor => {
	let tabSize: number
	let prevLength = 0
	let lineIndentMap: number[] = []
	let active = -1
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
			const newIndents = getIndents(value.split("\n"), tabSize)
			const l = newIndents.length

			for (let i = 0, prev: number[] = [], next = newIndents[0]; next; i++) {
				const style = (lines[i] ||= indentTemplate() as HTMLDivElement).style
				const [top, height, left] = next
				const old = indents[i]

				next = newIndents[i + 1]

				if (top != old?.[0]) style.top = top + "00%"
				if (height != old?.[1]) style.height = height + "00%"
				if (left != old?.[2]) style.left = left * 100 + "%"

				const isSingleIndent = prev[0] != top && next?.[0] != top
				const isSingleOutdent =
					prev[0] + prev[1] != top + height && next?.[0] + next?.[1] != top + height

				for (let j = -isSingleIndent, l = height + (isSingleOutdent as any); j < l; j++)
					lineIndentMap[j + top] = i

				prev = indents[i] = newIndents[i]
			}

			for (let i = prevLength; i > l; ) lines[--i].remove()
			container.append(...lines.slice(prevLength, (prevLength = l)))
		}

		const newActive = lineIndentMap[editor.activeLine - 1] ?? -1

		if (newActive != active) {
			if (active + 1) lines[active].className = ""
			if (newActive + 1) lines[newActive].className = "active"
		}

		container.style.display = wordWrap ? "none" : ""
		active = newActive
		prevValue = value
	})

	return container
}

const getIndents = (lines: string[], tabSize: number) => {
	const l = lines.length
	const stack: number[][] = []
	const results: number[][] = []

	for (let prevIndent = 0, emptyPos = -1, i = 0, p = 0; ; i++) {
		const last = i == l
		const indent = last ? 0 : getIndentCount(lines[i], tabSize)
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

const getIndentCount = (text: string, tabSize: number) => {
	let l = text.search(/\S/)
	let result = 0
	if (l < 0) return l
	for (let i = 0; i < l; ) {
		result += text[i++] == "\t" ? tabSize - (result % tabSize) : 1
	}
	return Math.ceil(result / tabSize)
}
