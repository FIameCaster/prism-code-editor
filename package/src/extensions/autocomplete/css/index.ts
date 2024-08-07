/** @module autocomplete/css */

import { PrismEditor } from "../../../index.js"
import { getClosestToken } from "../../../utils/index.js"
import { Bracket } from "../../matchBrackets/index.js"
import { htmlTags } from "../markup/index.js"
import { Completion, CompletionContext, CompletionSource } from "../types.js"
import { atRules, cssValues, pseudoClasses, pseudoElements } from "./data.js"

const hasStyleRules = ["container", "supports", "layer", "media", "scope"]

const atRule = /@([\w-]*)(?!\w|-)(?:[^;{"']|"(?:\\[\s\S]|[^\\\n"])*"|'(?:\\[\s\S]|[^\\\n'])*')*$/

const tagNames: Completion[] = Object.keys(htmlTags).map(tag => ({ label: tag, icon: "keyword" }))

const getProperties = () => {
	if (!properties) {
		properties = []
		const style = document.body.style
		const seen = new Set<string>()
		for (let key in style) {
			if (typeof style[key] == "string" && !/-|^moz|^webkit/.test(key)) {
				key = key.replace(/[A-Z]/g, char => "-" + char.toLowerCase())
				if (!seen.has(key)) {
					seen.add(key)
					properties.push({
						label: key,
						icon: "property",
						insert: key + ": ;",
						tabStops: [key.length + 2],
					})
				}
			}
		}
	}
	return properties
}

/**
 * Completion context for CSS that adds completion for HTML tags, pseudo-elements,
 * pseudo-classes, at-rules, CSS properties and property values.
 */
const cssCompletion: CompletionSource = (context: CompletionContext, editor: PrismEditor) => {
	let before = context.before
	let pos = context.pos
	let matcher = editor.extensions.matchBrackets
	let from = before.search(/[\w-]*$/)
	let options: Completion[] | undefined
	let currentStatement = before.match(/[^{};]*$/)![0].trimStart()

	if (getClosestToken(editor, ".comment,.string")) return

	if (getClosestToken(editor, ".attr-value")) {
		options = currentStatement.includes(":") ? cssValues : getProperties()
	} else {
		const atRuleMatch = before.match(atRule)

		if (atRuleMatch) {
			if (atRuleMatch.index! + atRuleMatch[1].length + 2 > pos) {
				from--
				options = atRules
			}
		} else if (matcher) {
			let { brackets, pairs } = matcher
			let i = 0
			let bracket: Bracket
			let inSelector = true
			let charBefore = before[from - 1]
			for (; (bracket = brackets[i]); i++) {
				if (
					bracket[3] == "{" &&
					bracket[1] < pos &&
					brackets[pairs[i]!]?.[5] > pos &&
					!hasStyleRules.includes(before.slice(0, bracket[1]).match(atRule)?.[1]!)
				) {
					inSelector = "&+>~:.#[".includes(currentStatement[0])
					break
				}
			}
			if (inSelector) {
				if (!/\[[^\]]*$/.test(currentStatement)) {
					if (charBefore == ":") {
						if (before[from - 2] == ":") {
							from -= 2
							options = pseudoElements
						} else {
							from--
							options = pseudoClasses
						}
					} else if (charBefore != "." && charBefore != "#") options = tagNames
				}
			} else {
				options = currentStatement.includes(":") ? cssValues : getProperties()
			}
		}
	}
	if (options && (from < pos || context.explicit)) {
		return {
			from,
			options,
		}
	}
}

let properties: Completion[]

export { cssCompletion, cssValues, pseudoClasses, pseudoElements, atRules }
