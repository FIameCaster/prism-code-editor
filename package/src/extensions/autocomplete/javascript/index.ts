/** @module autocomplete/javascript */

import { PrismEditor } from "../../../index.js"
import { braces, space, spread } from "../../../prism/utils/jsx-shared.js"
import { re } from "../../../prism/utils/shared.js"
import { getClosestToken } from "../../../utils/index.js"
import { Bracket } from "../../matchBrackets/index.js"
import { Completion, CompletionContext, CompletionSource } from "../types.js"
import { findIdentifiers } from "../utils.js"

export type JSContext = {
	/**
	 * Whether autocomplete should be disabled due to happening inside a regex, string,
	 * comment or variable name declaration
	 */
	disabled: boolean
	/**
	 * List of identifiers that were separated by `.` or `?.` before the cursor.
	 *
	 * Here's a list of strings before the cursor and the corresponding path:
	 * - `a.b.c` -> `["a", "b", "c"]`
	 * - `a.b.` -> `["a", "b", ""]`
	 *
	 * If there's no identifier before the cursor, the path will be `[""]`.
	 * If completion shouldn't happen where the cursor is, `path` will be `null`.
	 * If `tagMatch` is present, `path` will also be `null`.
	 */
	path: string[] | null
	/**
	 * If the current language is `jsx` or `tsx` and the cursor is in a tag, this match
	 * will be present.
	 *
	 * There are three capture groups:
	 * 1) The tags' name
	 * 2) The last attribute's name
	 * 3) Is present if the cursor is inside an attribute value
	 */
	tagMatch: null | RegExpMatchArray
}

const identifierPattern = [/(?!\s)[$\w\xa0-\uffff]/.source]

const identifier = /* @__PURE__ */ re("^(?!d)<0>+$", identifierPattern)

const pathRE = /* @__PURE__ */ re(/(?:(?!\d)<0>+\s*\??\.\s*)*(?!\d)<0>*$/.source, identifierPattern)

const tagPattern = /* @__PURE__ */ re(
	/(?:^|[^$\w])(?:<|<(?!\d)([^\s/=><%]+)(?:<0>(?:<0>*(?:([^\s"'{=<>/*]+)(?:<0>*=<0>*(?!\s)(?:"[^"]*"|'[^']*'|<1>)?|(?![^\s=]))|<2>))*<0>*(?:=<0>*("[^"]*|'[^']*))?)?)$/
		.source,
	[space, braces, spread],
)

/**
 * Adds extra properties to the completion context used by JavaScript completion sources.
 */
const jsContext = (context: CompletionContext, editor: PrismEditor): JSContext => {
	const before = context.before
	const pos = context.pos
	const matcher = editor.extensions.matchBrackets
	let enabled = !getClosestToken(editor, ".regex,.comment")
	let tagMatch: null | RegExpMatchArray = null

	if (enabled) {
		if (context.language.slice(1) == "sx") {
			tagMatch = before.match(tagPattern)
			if (tagMatch?.[0][1] == "<") {
				tagMatch![0] = tagMatch![0].slice(1)
				tagMatch!.index!++
			}
		}
		if (tagMatch && getClosestToken(editor, ".string", 0, 0, tagMatch.index! + 1)) {
			tagMatch = null
		}
		if (!tagMatch) {
			enabled =
				!getClosestToken(editor, ".string") &&
				!/\b(?:const|let|var|class|enum|interface|type)\s+(?:(?!\s)[$\w\xa0-\uffff])*$/.test(before)
		}
	}

	if (enabled && matcher && !tagMatch) {
		let { brackets, pairs } = matcher
		let i = 0
		let bracket: Bracket
		for (; (bracket = brackets[i]); i++) {
			if (
				bracket[4] &&
				bracket[1] < pos &&
				brackets[pairs[i]!]?.[5] > pos &&
				/\b(?:const|let|var)\s*$/.test(before.slice(0, bracket[1]))
			) {
				enabled = false
				i = 9e9
			}
		}
	}

	return {
		tagMatch,
		disabled: !enabled,
		path: enabled && !tagMatch ? before.match(pathRE)![0].split(/[\s?.]+/) : null,
	}
}

const propertyCache = new WeakMap<any, Completion[]>()

const enumerateOwnProperties = (obj: any) => {
	let options: Completion[] = []
	let seen = new Set<string>()
	let boost = 0
	let temp = obj

	for (; temp; temp = Object.getPrototypeOf(temp), boost--) {
		Object.getOwnPropertyNames(temp).forEach(name => {
			if (!seen.has(name) && identifier.test(name)) {
				seen.add(name)
				let isFunc!: boolean
				try {
					isFunc = typeof obj[name] == "function"
				} catch (_) {}
				options.push({
					label: name,
					boost,
					icon: isFunc
						? /[A-Z]/.test(name[0])
							? "class"
							: "function"
						: /^[A-Z_]+$/.test(name)
						? "constant"
						: "variable",
				})
			}
		})
	}

	return options
}

/**
 * Returns a completion source that adds completions for a scope object.
 * @param scope Scope object you want to provide completions for. For example `window`.
 */
const completeScope =
	(scope: any): CompletionSource<{ path: string[] | null }> =>
	({ path, pos, explicit }) => {
		if (path && (path[0] || explicit)) {
			let target = scope
			let last = path.length - 1
			let i = 0
			while (i < last) {
				try {
					target = target[path[i++]]
					if (target == null) return
				} catch (_) {
					return
				}
			}
			target = Object(target)

			if (!propertyCache.has(target)) propertyCache.set(target, enumerateOwnProperties(target))

			return {
				from: pos - path[last].length,
				options: propertyCache.get(target)!,
			}
		}
	}

const includedTypes = new Set([
	"parameter",
	"class-name",
	"constant",
	"function",
	"maybe-class-name",
	"generic-function",
])

const identifierSearch = re(/<0>+/.source, identifierPattern, "g")

const completeIdentifiers: CompletionSource<JSContext> = (context, editor) => {
	const path = context.path
	if (path && (path[0] || context.explicit)) {
		return {
			from: context.pos - path[path.length - 1].length,
			options: findIdentifiers(
				context,
				editor,
				type => includedTypes.has(type),
				identifierSearch,
			).map(label => ({
				label,
			})),
		}
	}
}

export { jsxTagCompletion } from "./jsx.js"
export { completeKeywords } from "./keywords.js"
export { globalReactAttributes, reactTags } from "./reactData.js"
export { completeSnippets, jsSnipets } from "./snippets.js"
export { jsContext, completeScope, completeIdentifiers }
