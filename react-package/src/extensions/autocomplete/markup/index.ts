/** @module autocomplete/markup */

import { PrismEditor } from "../../.."
import { getClosestToken } from "../../../utils"
import {
	AttributeConfig,
	Completion,
	CompletionContext,
	CompletionSource,
	TagConfig,
} from "../types"
import { optionsFromKeys } from "../utils"

const tagPattern =
	/<$|<(?![!\d])([^\s/=>$<%]+)(?:\s(?:\s*([^\s/"'=>]+)(?:\s*=\s*(?!\s)(?:"[^"]*(?:"|$)|'[^']*(?:'|$)|[^\s"'=>]+(?!\S))?|(?![^\s=])))*\s*)?$/

/**
 * `false` is returned if completion shouldn't happen at the current position.
 * `null` is returned if the cursor isn't in a tag.
 *
 * If completion should happen and the cursor is in a tag, a match array is
 * returned. The match has two capturing groups; the tag's name and the last attribute's
 * name.
 */
const getTagMatch = ({ explicit, before, pos }: CompletionContext, editor: PrismEditor) => {
	return getClosestToken(editor, ".comment,.cdata,.prolog,.doctype", 0, 0, pos) ||
		(!explicit && /\s/.test(before.slice(-1)))
		? false
		: tagPattern.exec(before)
}

/**
 * Completion source that adds auto completion for HTML tags.
 * @param tags Object mapping tag-names to completable attributes for that tag.
 * @param globalAttributes Completable attributes shared by all tags.
 * @returns A Completion source.
 */
const markupCompletion = (tags: TagConfig, globalAttributes: AttributeConfig): CompletionSource => {
	const tagOptions = optionsFromKeys(tags, "property")
	const attrOptions = optionsFromKeys(globalAttributes, "enum")

	return (context, editor) => {
		const tagMatch = getTagMatch(context, editor)

		if (tagMatch) {
			let [tag, tagName, lastAttr] = tagMatch
			let start = tagMatch.index
			let from = start + 1
			let options: Completion[] | undefined = tagOptions

			if (/\s/.test(tag)) {
				let tagAttrs = tags[tagName]
				from = start + tag.search(/[^\s"'=]*$/)

				if (/=\s*(?:"[^"]*|'[^']*|[^\s"'=]*)$/.test(tag)) {
					options = (globalAttributes[lastAttr] || tagAttrs?.[lastAttr])?.map(val => ({
						label: val,
						icon: "unit",
					}))
				} else {
					options = tagAttrs ? attrOptions.concat(optionsFromKeys(tagAttrs, "enum")) : attrOptions
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

export { htmlTags, globalHtmlAttributes } from "./data.js"
export { svgTags, globalSvgAttributes } from "./svgData.js"
export { markupCompletion, getTagMatch }
