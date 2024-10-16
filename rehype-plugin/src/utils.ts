import { renderCodeBlock, renderEditor } from "prism-code-editor/ssr"

const parseValue = (value: string) => {
	if (value && `"'{`.includes(value[0])) value = value.slice(1, -1)

	if (!value || value == "true") return true
	if (value == "false") return false
	if (value == "null") return null
	if (!isNaN(+value)) return +value
	return value
}

export const parseMeta = (meta: string) => {
	const result: Record<string, any> = {}
	const pattern = /([^\s"'{}=]+)(?:\s*=\s*("[^"]*"|'[^']*'|\{[^}]*\}|[^\s"'{}=]+))?/g

	let match: RegExpExecArray | null
	while ((match = pattern.exec(meta))) {
		let [, prop, value] = match
		result[prop] = parseValue(value)
	}
	return result
}

export const createEditor = (props: Record<string, any>) => {
	const tokenizeCallback = props.tokenizeCallback
	delete props.tokenizeCallback
	return renderEditor(props as any, { tokenizeCallback })
}

export const createCodeBlock = (props: Record<string, any>) => renderCodeBlock(props as any)
