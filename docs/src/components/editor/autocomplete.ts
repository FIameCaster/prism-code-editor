import "prism-code-editor/autocomplete.css"
import "prism-code-editor/autocomplete-icons.css"
import {
	registerCompletions,
	fuzzyFilter,
	autoComplete,
	completeFromList,
} from "prism-code-editor/autocomplete"
import {
	completeKeywords,
	jsDocCompletion,
	jsxTagCompletion,
	reactTags,
	globalReactAttributes,
	jsSnipets,
	jsContext,
	jsCompletion,
} from "prism-code-editor/autocomplete/javascript"
import { cssCompletion } from "prism-code-editor/autocomplete/css"
import {
	globalHtmlAttributes,
	globalMathMLAttributes,
	globalSvgAttributes,
	htmlTags,
	markupCompletion,
	mathMLTags,
	svgTags,
} from "prism-code-editor/autocomplete/markup"
import { editors } from "./mount"
import { vueCompletion } from "prism-code-editor/autocomplete/vue"
import { svelteBlockSnippets, svelteCompletion } from "prism-code-editor/autocomplete/svelte"

registerCompletions(["javascript", "js", "jsx", "tsx", "typescript", "ts"], {
	context: jsContext,
	sources: [
		jsCompletion(window),
		completeKeywords,
		jsDocCompletion,
		jsxTagCompletion(reactTags, globalReactAttributes),
		completeFromList(jsSnipets),
	],
})

registerCompletions(["html", "markup"], {
	sources: [
		markupCompletion(
			[
				{
					tags: htmlTags,
				},
				{
					tags: svgTags,
					globals: globalSvgAttributes,
				},
				{
					tags: mathMLTags,
					globals: globalMathMLAttributes,
				},
				{
					tags: {
						"my-custom-element": {
							hello: ["world"],
							foo: null,
							bar: null,
						},
					},
				},
			],
			globalHtmlAttributes,
		),
	],
})

registerCompletions(["css"], {
	sources: [cssCompletion()],
})

registerCompletions(["vue"], {
	sources: [
		vueCompletion({
			MyComponent: {
				hello: ["world"],
				onevent: null,
			},
		}),
	],
})

registerCompletions(["svelte"], {
	sources: [
		svelteCompletion(svelteBlockSnippets, {
			MyComponent: {
				hello: ["world"],
				onevent: null,
			},
		}),
	],
})

editors.forEach(editor =>
	editor.addExtensions(
		autoComplete({
			filter: fuzzyFilter,
		}),
	),
)
