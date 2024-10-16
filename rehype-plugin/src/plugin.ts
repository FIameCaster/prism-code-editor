import type { Plugin } from "unified"
import type { Root, Element } from "hast"
import { visitParents } from "unist-util-visit-parents"
import { fromHtml } from "hast-util-from-html"
import { createCodeBlock, createEditor, parseMeta } from "./utils.js"
import { PcePluginOptions } from "./types.js"

export const rehypePrismCodeEditor: Plugin<[PcePluginOptions?], Root> = ({
	editorsOnly,
	defaultEditorProps,
	defaultCodeBlockProps,
	customRenderer,
} = {}) => {
	return tree => {
		const nodes: [Element, Element, Element, string][] = []

		visitParents(tree, { type: "element", tagName: "code" }, (node, ancestors) => {
			const [parent, pre] = ancestors.slice(-2) as Element[]
			if (pre.tagName != "pre" || pre.children[1]) return

			const children = node.children
			const text = children[0]
			if (children[1] || text.type != "text") return

			nodes.push([node, pre, parent, text.value.slice(0, -1)])
		})

		nodes.forEach(([codeEl, pre, parent, code]) => {
			const properties = codeEl.properties
			const meta = ((codeEl.data as any)?.meta || properties.metastring || "") as string
			const props = parseMeta(meta)
			const isEditor = props.editor

			if (editorsOnly && isEditor == null) return

			props[isEditor ? "value" : "code"] = code
			delete props.editor

			let className = properties.className
			if (Array.isArray(className)) className = className.join(" ")

			const lang =
				(typeof className == "string" && /\blanguage-(\S+)/.exec(className)?.[1]) || "text"

			props.language = lang.replace(/\b\+\+/g, "pp").replace(/\b#/g, "sharp")

			const renderFunc = isEditor ? createEditor : createCodeBlock
			const merged = { ...(isEditor ? defaultEditorProps : defaultCodeBlockProps), ...props }
			const html = customRenderer ? customRenderer(merged, renderFunc) : renderFunc(merged)
			const children = parent.children

			children[children.indexOf(pre)] = fromHtml(html, { fragment: true }).children[0] as Element
		})
	}
}
