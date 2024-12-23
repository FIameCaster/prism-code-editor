import { languageMap } from ".."
import { markupTemplateLang } from "./shared"

languageMap.mustache = languageMap.hbs = markupTemplateLang("handlebars", {
	block: ["{{!", "}}"],
})
