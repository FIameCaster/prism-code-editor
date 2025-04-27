import { getIndentGuides } from "../extensions/guides.js"
import { renderEditor, RenderOptions } from "./index.js"

/**
 * Function that renders indentation guides for an editor as an HTML string. Intended to
 * be used as an overlay with {@link renderEditor}.
 * @param options Render options for the editor.
 * @returns HTML string for the indentation guides.
 */
const indentGuides = (options: RenderOptions) => {
	if (!options.wordWrap) {
		let html = "<div class=guide-indents>\t"
		let indents = getIndentGuides(options.value, +options.tabSize! || 2)
		let active!: number
		let i = 0
		let top: number
		let indent: number[]

		for (; (top = indents[i]?.[0]), top < 2; i++) {
			if (!top) active = i
			else {
				if (indents[i + 1]?.[0] != 1) active = i
				break
			}
		}

		for (i = 0; (indent = indents[i]); i++) {
			html += `<div style=top:${indent[0]}00%;left:${indent[1]}00%;height:${indent[2]}00%${
				i == active ? " class=active-indent" : ""
			}></div>`
		}

		return html + "</div>"
	}
}

export { indentGuides }
