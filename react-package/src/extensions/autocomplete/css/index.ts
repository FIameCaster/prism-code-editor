/** @module autocomplete/css */

import { PrismEditor } from "../../.."
import { doc } from "../../../core"
import { getClosestToken } from "../../../utils"
import { getLineStart } from "../../../utils/local"
import { Bracket } from "../../match-brackets"
import { htmlTags } from "../markup"
import { Completion, CompletionContext, CompletionSource } from "../types"
import { findWords } from "../utils"
import { atRules, cssValues, pseudoClasses, pseudoElements } from "./data"

const hasStyleRules = ["container", "supports", "layer", "media", "scope"]

const atRule = /@([\w-]*)(?!\w|-)(?:[^;{"']|"(?:\\[\s\S]|[^\\\n"])*"|'(?:\\[\s\S]|[^\\\n'])*')*$/

const tagNames: Completion[] = Object.keys(htmlTags).map(tag => ({ label: tag, icon: "keyword" }))

const createPropCompletion = (prop: string, icon?: Completion["icon"]) => ({
	label: prop,
	icon: icon,
	insert: prop + ": ;",
	tabStops: [prop.length + 2],
})

const getCSSProperties = () => {
	if (!properties) {
		properties = []
		const style = doc!.body.style
		const seen = new Set<string>()
		for (let key in style) {
			if (typeof style[key] == "string" && !/-|^moz|^webkit/i.test(key)) {
				key = key.replace(/[A-Z]/g, char => "-" + char.toLowerCase())
				if (!seen.has(key)) {
					seen.add(key)
					properties.push(createPropCompletion(key, "property"))
				}
			}
		}
	}
	return properties
}

/**
 * Completion source for CSS that adds completion for HTML tags, pseudo-elements,
 * pseudo-classes, classes, CSS variables, at-rules, CSS properties and property values.
 * Requires the `css-extras` grammar and bracket matching extension to work correctly.
 * @param classes List of class names that should be completed even if they're not found
 * in the editor. Each string must be prefixed with `.`.
 * @param variables List of CSS variables that should be completed even if they're not
 * found in the editor. Each string must be prefixed with `--`.
 * @returns A completion source.
 */
const cssCompletion = (
	classes?: Iterable<string>,
	variables?: Iterable<string>,
): CompletionSource => {
	return (context: CompletionContext, editor: PrismEditor) => {
		let before = context.before
		let pos = context.pos
		let matcher = editor.extensions.matchBrackets
		let from = context.lineBefore.search(/[\w-]*$/) + getLineStart(before, pos)
		let options: Completion[] | undefined
		let currentStatement = before
			.slice(Math.max(...["{", "}", ";"].map(c => before.lastIndexOf(c))) + 1)
			.trimStart()

		let colonIndex = currentStatement.lastIndexOf(":")
		let inPropValue = colonIndex > -1

		let setPropCompletion = () => {
			options = Array.from(
				findWords(context, editor, type => type == "variable", /.+/g, variables, true),
				name =>
					inPropValue
						? {
								label: name,
								insert: inPropValue ? `var(${name})` : name,
						  }
						: createPropCompletion(name),
			)
			options!.push(...(inPropValue ? cssValues : getCSSProperties()))
		}

		if (getClosestToken(editor, ".comment,.string", 0, 0, pos)) return

		if (getClosestToken(editor, ".tag", 0, 0, pos)) {
			inPropValue = inPropValue && !/style\s*=/.test(currentStatement.slice(colonIndex))
			setPropCompletion()
		} else {
			const atRuleMatch = atRule.exec(before)

			if (atRuleMatch) {
				if (atRuleMatch.index + atRuleMatch[1].length + 2 > pos) {
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
						bracket[4] == "{" &&
						bracket[1] < pos &&
						brackets[pairs[i]!]?.[2] > pos &&
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
						} else if (charBefore == ".") {
							options = Array.from(
								findWords(
									context,
									editor,
									type => type == "selector" || type == "class",
									/.+/g,
									classes,
									true,
								),
								name => ({ label: name, icon: "keyword" }),
							)
							from--
						} else if (charBefore != "#") options = tagNames
					}
				} else if (charBefore != "#") {
					setPropCompletion()
				}
			}
		}
		if (options && ((from < pos && /\D/.test(before[from])) || context.explicit)) {
			return {
				from,
				options,
			}
		}
	}
}

let properties: Completion[]

export { cssCompletion, cssValues, pseudoClasses, pseudoElements, atRules, getCSSProperties }
