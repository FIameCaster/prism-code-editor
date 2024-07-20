import { PrismEditor } from "../../.."
import { getClosestToken } from "../../../utils"
import { Bracket } from "../../matchBrackets"
import { Completion, CompletionContext, CompletionSource } from "../types"

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
	 * If completion shouldn't happen where the cursor is, the path will be `null`.
	 */
	path: string[] | null
}

const identifier = /^(?!\d)(?:(?!\s)[$\w\xa0-\uffff])+$/

const pathRE = /(?:(?!\d)(?:(?!\s)[$\w\xa0-\uffff])+\s*\??\.\s*)*(?!\d)(?:(?!\s)[$\w\xa0-\uffff])*$/

const jsContext = (context: CompletionContext, editor: PrismEditor): JSContext => {
	const before = context.before
	const pos = context.pos
	const matcher = editor.extensions.matchBrackets
	let disabled =
		!!getClosestToken(editor, ".regex,.comment,.string") ||
		/\b(?:const|let|var|class|enum|interface|type)\s+(?:(?!\s)[$\w\xa0-\uffff])*$/.test(before)

	if (!disabled && matcher) {
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
				disabled = true
				i = 9e9
			}
		}
	}

	return {
		disabled,
		path: disabled ? null : before.match(pathRE)![0].split(/[\s?.]+/),
	}
}

const propertyCache = new WeakMap<any, Completion[]>()

const enumerateOwnProperties = (obj: any) => {
	let options: Completion[] = []
	let seen = new Set<string>()
	let boost = 0

	for (; obj; obj = Object.getPrototypeOf(obj), boost--) {
		Object.getOwnPropertyNames(obj).forEach(name => {
			if (!seen.has(name) && identifier.test(name)) {
				seen.add(name)
				options.push({ label: name, boost })
			}
		})
	}

	return options
}

const completeScope =
	(scope: any): CompletionSource<{ path: string[] | null }> =>
	({ path, pos, explicit }) => {
		if (path && (path[0] || explicit)) {
			let target = scope
			let last = path.length - 1
			let i = 0
			while (i < last && target) {
				target = target[path[i++]]
			}
			if (typeof target == "object") {
				if (!propertyCache.has(target)) propertyCache.set(target, enumerateOwnProperties(target))

				return {
					from: pos - path[last].length,
					options: propertyCache.get(target)!,
				}
			}
		}
	}

export { jsContext, completeScope }
