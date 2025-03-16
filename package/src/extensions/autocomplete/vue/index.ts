import { globalHtmlAttributes, globalSvgAttributes, htmlTags, svgTags } from "../markup/index.js"
import { getTagMatch } from "../markup/index.js"
import { AttributeConfig, Completion, CompletionSource, TagConfig } from "../types.js"
import { attrSnippet, optionsFromKeys } from "../utils.js"

const createCompletion = (
	label: string,
	icon?: Completion["icon"],
	boost?: number,
): Completion => ({
	label,
	icon,
	boost,
})

const tagNames = Array.from(new Set(Object.keys(htmlTags).concat(Object.keys(svgTags))), name =>
	createCompletion(name, "property"),
)

const langs = {
	script: ["js", "ts", "jsx", "tsx"],
	style: ["css", "scss", "sass", "stylus", "less"],
}

const eventModifiers = [
	".stop",
	".prevent",
	".self",
	".capture",
	".once",
	".passive",
	".left",
	".right",
	".middle",
].map(modifier => createCompletion(modifier, "enum"))

const modelModifiers = [".lazy", ".number", ".trim"].map(modifier =>
	createCompletion(modifier, "enum"),
)

const bindModifiers = [".camel", ".prop", ".attr"].map(modifier =>
	createCompletion(modifier, "enum"),
)

const enumerateAttrs = (
	attrs: AttributeConfig,
	result: Completion[] = [],
	noEvents?: boolean,
	boost?: number,
) => {
	for (let attr in attrs) {
		if (attr.slice(0, 2) == "on") {
			if (!noEvents) {
				result.push(
					attrSnippet("@" + attr.slice(2), '""', "event", boost),
					attrSnippet("v-on:" + attr.slice(2), '""', "event", boost),
				)
			}
		} else {
			result.push(
				createCompletion(attr, "enum", boost),
				attrSnippet(":" + attr, '""', "enum", boost),
				attrSnippet("v-bind:" + attr, '""', "enum", boost),
			)
		}
	}
	return result
}

const vueAttrs = enumerateAttrs({
	key: null,
	ref: null,
})

const globalsNoEvents = enumerateAttrs(globalHtmlAttributes, [], true)

/**
 * Completion source that adds completion for HTML and SVG tags to Vue. When configured,
 * it can also provide completion for specific Vue components.
 * @param components Used to configure autocompletion for Vue components. This is an
 * object mapping each component's name to the properties available for that component.
 * To provide completion for events, prefix them with `on`. Passing `onevent` will result
 * in completions for `@event` or `v-on:event` for example. Camel cased props are not
 * converted to kebab case.
 * @param nestedSource Completion source that will be used whenever the completion isn't
 * happening inside a tag. Can be used to provide completion of snippets for example.
 */
const vueCompletion =
	(components?: TagConfig, nestedSource?: CompletionSource): CompletionSource =>
	(context, editor) => {
		const tagMatch = getTagMatch(context, editor)

		if (tagMatch) {
			let [tag, tagName, lastAttr] = tagMatch
			let start = tagMatch.index
			let from = start + 1
			let options: Completion[] | undefined

			if (/\s/.test(tag)) {
				let inAttrValue = /=\s*(?:"[^"]*|'[^']*|[^\s"'=]*)$/.test(tag)
				let i = 0
				from = start + tag.search(/[^\s"'=]*$/)
				for (; ; i++) {
					let tags = i ? (i > 1 ? components : svgTags) : htmlTags
					let globalAttrs = i ? (i > 1 ? null : globalSvgAttributes) : globalHtmlAttributes
					let tagAttrs = tags?.[tagName]

					if (tagAttrs || i > 1) {
						if (inAttrValue) {
							options = (
								lastAttr == "lang"
									? langs[tagName as keyof typeof langs]
									: globalAttrs?.[lastAttr] || tagAttrs?.[lastAttr]
							)?.map(val => createCompletion(val, "unit"))
						} else if (lastAttr?.includes(".")) {
							if (/^@|^v-on:/.test(lastAttr)) options = eventModifiers
							else if (lastAttr.slice(0, 6) == "v-bind") options = bindModifiers
							else if (lastAttr.slice(0, 7) == "v-model") options = modelModifiers
							from = start + tag.lastIndexOf(".")
						} else {
							options = []
							if (tagAttrs) enumerateAttrs(tagAttrs, options, false, globalAttrs ? 0 : 50)
							if (globalAttrs) enumerateAttrs(globalAttrs, options)
							else options.push(...globalsNoEvents)
							options.push(...vueAttrs)
						}
						break
					}
				}
			} else {
				options = components ? tagNames.concat(optionsFromKeys(components, "property")) : tagNames
			}

			if (options) {
				return {
					from,
					options,
				}
			}
		}

		if (tagMatch != false) return nestedSource?.(context, editor)
	}

;[
	"bind",
	"cloak",
	"html",
	"memo",
	"model",
	"on",
	"once",
	"pre",
	"show",
	"slot",
	"text",
	"else",
	"else-if",
	"for",
	"if",
].forEach((directive, i) => {
	vueAttrs.push(createCompletion("v-" + directive, i > 10 ? "keyword" : "function"))
})

export { vueCompletion }
