import { createTemplate } from "../core"
import { Extension, PrismEditor } from "../types"

const template = createTemplate(
	'<style>.guide-indents div{width:1px;position:absolute;background:var(--bg-guide-indent)}.guide-indents .active{background:var(--bg-guide-indent-active)}</style><div class="guide-indents" style="position:relative;"> </div>',
	"left:var(--padding-left)",
)

export interface IndentGuides extends Extension {
	/** Collection of all the guide lines. */
	readonly lines: HTMLCollectionOf<HTMLDivElement>
	/** Indentation for each line. Is -1 for lines with only whitespace. */
	readonly indentLevels: number[]
}

/** Adds indent guides to an editor. Does not work with word wrap. */
export const indentGuides = (): IndentGuides => {
	let currentTabSize: number,
		prevLength = 0,
		lineIndentMap: number[],
		active = -1,
		currentEditor: PrismEditor,
		currentWrap: boolean

	const lines: HTMLDivElement[] = [],
		indents: number[][] = [],
		container = <HTMLDivElement>template.cloneNode(true),
		guideHeight = <HTMLDivElement>container.lastChild,
		indentLevels: number[] = []

	const update = (code: string) => {
		lineIndentMap = []
		const newIndents = getIndents(code.split("\n")),
			l = newIndents.length

		for (let i = 0, prev: number[] = [], next = newIndents[0]; next; i++) {
			const { style } = lines[i] || (lines[i] = document.createElement("div")),
				[top, height, left] = next,
				old = indents[i]

			next = newIndents[i + 1]

			if (top != old?.[0]) style.top = top + "00%"
			if (height != old?.[1]) style.height = height + "00%"
			if (left != old?.[2]) style.left = left + "ch"

			const isSingleIndent = prev[0] != top && next?.[0] != top,
				isSingleOutdent = prev[0] + prev[1] != top + height && next?.[0] + next?.[1] != top + height

			for (let j = isSingleIndent ? -1 : 0, l = isSingleOutdent ? height + 1 : height; j < l; j++)
				lineIndentMap[j + top] = i

			prev = indents[i] = newIndents[i]
		}

		for (let i = prevLength; i > l; ) lines[--i].remove()
		guideHeight.append(...lines.slice(prevLength, (prevLength = l)))
	}

	const updateActive = () => {
		const newActive = lineIndentMap[currentEditor.activeLineNumber - 1] ?? -1

		if (newActive != active) {
			active > -1 && (lines[active].className = "")
			newActive > -1 && (lines[newActive].className = "active")
		}
		active = newActive
	}

	const getIndents = (lines: string[]) => {
		const l = lines.length,
			stack: number[][] = [],
			results: number[][] = []

		for (let prevIndent = 0, emptyPos = -1, i = 0, p = 0; ; i++) {
			const last = i == l,
				indent = last ? 0 : (indentLevels[i] = getIndentCount(lines[i]))
			if (indent == -1) {
				if (emptyPos == -1) emptyPos = i
			} else {
				for (let j = indent; j < prevIndent; j++) {
					// Updating height of the closed lines
					stack[j][1] = (emptyPos > -1 && (j > indent || last) ? emptyPos : i) - stack[j][0]
				}
				for (let j = prevIndent; j < indent; ) {
					// Adding new indentation lines
					results[p++] = stack[j] = [
						emptyPos == -1 || j > prevIndent ? i : emptyPos,
						0,
						j++ * currentTabSize,
					]
				}
				emptyPos = -1
				prevIndent = indent
			}
			if (last) break
		}
		indentLevels.splice(l)
		return results
	}

	const getIndentCount = (text: string) => {
		let l = text.search(/\S/),
			result = 0
		if (l == -1) return -1
		for (let i = 0; i < l; ) {
			result += text[i++] == "\t" ? currentTabSize - (result % currentTabSize) : 1
		}
		return Math.ceil(result / currentTabSize)
	}

	return {
		lines: <HTMLCollectionOf<HTMLDivElement>>guideHeight.children,
		get indentLevels() {
			return indentLevels
		},
		update(editor, { wordWrap = false, tabSize }) {
			let wrapChanged = currentWrap != (currentWrap = wordWrap),
				tabChanged = currentTabSize != (currentTabSize = tabSize || 2)

			if (currentEditor != (currentEditor = editor) || wrapChanged) {
				wordWrap ? container.remove() : editor.overlays.append(container)

				const listener = wordWrap ? editor.removeListener : editor.addListener
				listener("update", update)
				listener("selectionChange", updateActive)
			}
			if (!wordWrap && (wrapChanged || tabChanged)) update(editor.value), updateActive()
		},
	}
}