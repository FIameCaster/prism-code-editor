import { renderCodeBlock, renderEditor } from "prism-code-editor/ssr"
import { CodeBlockProps } from "./types"

const parseValue = (value: string, numLines: number) => {
	if (value[0] == '"' || value[0] == "'") value = value.slice(1, -1)
	if (value[0] == "{") return parseRanges(value, numLines)

	if (!value || value == "true") return true
	if (value == "false") return false
	if (value == "null") return null
	if (!isNaN(+value)) return +value
	return value
}

const parseRanges = (ranges: string, numLines: number) => {
	let pattern = /(\d+)(?:\s*-\s*(\d+))?/g
	let match: RegExpExecArray | null
	let result = new Set<number>()
	while ((match = pattern.exec(ranges))) {
		let start = Math.max(1, +match[1])
		let end = Math.min(+match[2] || start, numLines)
		while (start <= end) result.add(start++)
	}
	return result
}

const getRanges = (props: CodeBlockProps, prop: string): Set<number> | undefined => {
	let ranges = props[prop]
	delete props[prop]
	if (ranges instanceof Set) return ranges
}

export const parseMeta = (meta: string, numLines: number) => {
	const result: Record<string, any> = {}
	const pattern = /([^\s"'{}=]+)(?:\s*=\s*("[^"]*"|'[^']*'|\{[^}]*\}|[^\s"'{}=]+))?/g

	let match: RegExpExecArray | null
	while ((match = pattern.exec(meta))) {
		let [, prop, value] = match
		result[prop] = parseValue(value || "", numLines)
	}
	return result as CodeBlockProps
}

export const createEditor = (props: CodeBlockProps) => {
	return renderEditor(props)
}

export const createCodeBlock = (props: CodeBlockProps) => {
	const highlight = getRanges(props, "highlight")
	const ins = getRanges(props, "ins")
	const del = getRanges(props, "del")

	if (highlight || ins || del) {
		props.addLineClass = (line: number) => {
			if (highlight?.has(line)) return "highlighted"
			if (ins?.has(line)) return "inserted"
			if (del?.has(line)) return "deleted"
			return ""
		}
	}

	return renderCodeBlock(props)
}
