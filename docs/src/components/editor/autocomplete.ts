import "prism-code-editor/autocomplete.css"
import "prism-code-editor/autocomplete-icons.css"
import {
	registerCompletions,
	fuzzyFilter,
	autoComplete,
	completeFromList,
} from "prism-code-editor/autocomplete"
import {
	completeIdentifiers,
	completeKeywords,
	jsDocCompletion,
	jsxTagCompletion,
	reactTags,
	globalReactAttributes,
	jsSnipets,
	jsContext,
} from "prism-code-editor/autocomplete/javascript"
import { cssCompletion } from "prism-code-editor/autocomplete/css"
import {
	globalHtmlAttributes,
	globalSvgAttributes,
	htmlTags,
	markupCompletion,
	svgTags,
} from "prism-code-editor/autocomplete/markup"
import { editors } from "./mount"

registerCompletions(["javascript", "js", "jsx", "tsx", "typescript", "ts"], {
	context: jsContext,
	sources: [
		completeIdentifiers(),
		completeKeywords,
		jsDocCompletion,
		jsxTagCompletion(reactTags, globalReactAttributes),
		completeFromList(jsSnipets),
	],
})

registerCompletions(["html", "markup"], {
	sources: [markupCompletion(htmlTags, globalHtmlAttributes)],
})

registerCompletions(["svg"], {
	sources: [markupCompletion(svgTags, globalSvgAttributes)],
})

registerCompletions(["css"], {
	sources: [cssCompletion()],
})

editors.forEach(editor =>
	editor.addExtensions(
		autoComplete({
			filter: fuzzyFilter,
		}),
	),
)
