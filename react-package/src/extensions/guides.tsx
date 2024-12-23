import { useLayoutEffect, useMemo, useRef } from "react"
import { PrismEditor } from "../types"
import { createTemplate } from "../utils/local"
import { useStableRef } from "../core"

const guideTemplate = createTemplate(
	"<div style=width:1px;position:absolute;background:var(--bg-guide-indent)>",
)

/** Component adding indent guides to an editor. Does not work with word wrap. */
export const IndentGuides = ({ editor }: { editor: PrismEditor }) => {
	let prevLength = 0
	let lineIndentMap: number[]
	let active: HTMLDivElement | undefined

	const container = useRef<HTMLDivElement>(null)
	const lines: HTMLDivElement[] = []
	const indents: number[][] = []

	const update = (code: string) => {
		lineIndentMap = []
		const tabSize = editor.props.tabSize || 2
		const newIndents = getIndentGuides(code, tabSize)
		const l = newIndents.length

		for (let i = 0, prev: number[] = [], next = newIndents[0]; next; i++) {
			const style = (lines[i] ||= guideTemplate()).style
			const [top, left, height] = next
			const old = indents[i]

			next = newIndents[i + 1]

			if (top != old?.[0]) style.top = top + "00%"
			if (left != old?.[1]) style.left = left * 100 + "%"
			if (height != old?.[2]) style.height = height + "00%"

			const isSingleIndent = prev[0] != top && next?.[0] != top,
				isSingleOutdent = prev[0] + prev[1] != top + height && next?.[0] + next?.[1] != top + height

			for (let j = -isSingleIndent, l = height + (isSingleOutdent as any); j < l; j++)
				lineIndentMap[j + top] = i

			prev = indents[i] = newIndents[i]
		}

		for (let i = l; i < prevLength; ) lines[i++].remove()
		container.current!.append(...lines.slice(prevLength, (prevLength = l)))
	}

	const updateActive = () => {
		const newActive = lines[lineIndentMap[editor.activeLine - 1]]

		if (newActive != active) {
			if (active) active.className = ""
			if (newActive) newActive.className = "active-indent"
			active = newActive
		}
	}

	const props = editor.props
	const noWrap = !props.wordWrap

	useLayoutEffect(
		useStableRef(() => {
			const value = editor.value
			const cleanup1 = editor.on("update", update)
			const cleanup2 = editor.on("selectionChange", updateActive)

			if (value) {
				update(value)
				updateActive()
			}

			return () => {
				cleanup1()
				cleanup2()
			}
		}),
		[props.tabSize],
	)

	return useMemo(() => {
		return (
			<div
				ref={container}
				className="guide-indents"
				style={{
					left: "var(--padding-left)",
					bottom: "auto",
					right: "auto",
					display: noWrap ? "" : "none",
				}}
			>
				{" "}
			</div>
		)
	}, [noWrap])
}

/**
 * Calculates position and height of indentation guides for a string of code.
 * @param code Code you want to calculate indentation lines for.
 * @param tabSize Number of spaces a tab is equal to.
 * @returns An array of indentation guides.
 * Each guide is a tuple containing 3 numbers with the following values:
 * - The starting line of the guide.
 * - How many spaces the guide is offset to the right.
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
				results[p++] = stack[j] = [emptyPos < 0 || j > prevIndent ? i : emptyPos, j++ * tabSize, 0]
			}
			emptyPos = -1
			prevIndent = indent
		}
		if (last) break
	}
	return results
}
