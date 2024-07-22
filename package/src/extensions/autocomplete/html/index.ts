import { getClosestToken } from "../../../utils/index.js"
import { AttributeConfig, Completion, CompletionSource, TagConfig } from "../types.js"

const tagPattern =
	/<$|<(?![!\d])([^\s/=>$<%]+)(?:\s(?:\s*([^\s/"'=>]+)(?:\s*=\s*(?!\s)(?:"[^"]*"|'[^']*'|[^\s"'=>]+(?!\S))?|(?![^\s=])))*\s*(?:=\s*(?:"[^"]*|'[^']*))?)?$/

const optionsFromKeys = (obj: object): Completion[] => Object.keys(obj).map(tag => ({ label: tag }))

const htmlCompletion = (tags: TagConfig, globalAttributes: AttributeConfig): CompletionSource => {
	const tagOptions = optionsFromKeys(tags)
	const attrOptions = optionsFromKeys(globalAttributes)

	return ({ before, explicit }, editor) => {
		if (
			getClosestToken(editor, ".comment,.cdata,.prolog") ||
			(!explicit && /\s/.test(before.slice(-1)))
		) {
			return
		}
		const tagMatch = before.match(tagPattern)

		if (tagMatch) {
			let [tag, tagName, lastAttr] = tagMatch
			let start = tagMatch.index!
			let from = start + 1
			let options: Completion[] | undefined = tagOptions

			if (/\s/.test(tagMatch[0])) {
				let tagAttrs = tags[tagName]
				from = start + tag.search(/[^\s="']*$/)

				if (/=\s*(?:"[^"]*|'[^']*|[^\s"'=>]*)$/.test(tag)) {
					options = (globalAttributes[lastAttr] || tagAttrs?.[lastAttr])?.map(val => ({
						label: val,
					}))
				} else {
					options = tagAttrs ? attrOptions.concat(optionsFromKeys(tagAttrs)) : attrOptions
				}
			}

			if (options) {
				return {
					from,
					options,
				}
			}
		}
	}
}

export { htmlTags, globalAttributes } from "./data.js"

export { htmlCompletion }
