import { JSContext } from "./index.js"
import { AttributeConfig, Completion, CompletionSource, TagConfig } from "../types.js"
import { optionsFromKeys } from "../utils.js"

/**
 * Completion source that adds auto completion for JSX tags.
 * @param tags Object mapping tag-names to completable attributes for that tag.
 * @param globalAttributes Completable attributes shared by all tags.
 * @returns A Completion source. Requires a JavaScript context to work.
 */
const jsxTagCompletion = (
	tags: TagConfig,
	globalAttributes: AttributeConfig,
): CompletionSource<JSContext> => {
	const tagOptions = optionsFromKeys(tags)
	const attrOptions = optionsFromKeys(globalAttributes)

	return ({ tagMatch, explicit }) => {
		if (tagMatch && (explicit || !/\s/.test(tagMatch[0].slice(-1)))) {
			let [tag, tagName, lastAttr, lastAttrValue] = tagMatch!
			let start = tagMatch!.index!
			let from = start + 1
			let options: Completion[] | undefined | 0 = tagOptions

			if (/[\s/]/.test(tagMatch![0])) {
				let tagAttrs = tags[tagName]
				from = start + tag.search(/[^\s="'{}]*$/)

				if (lastAttrValue) {
					options = (globalAttributes[lastAttr] || tagAttrs?.[lastAttr])?.map(val => ({
						label: val,
					}))
				} else {
					options =
						tag.slice(-1) == "="
							? 0
							: tagAttrs
							? attrOptions.concat(optionsFromKeys(tagAttrs))
							: attrOptions
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

export { jsxTagCompletion }
