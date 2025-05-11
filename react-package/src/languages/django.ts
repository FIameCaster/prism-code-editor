import { languageMap } from ".."
import { markupTemplateLang } from "./shared"

languageMap.jinja2 = markupTemplateLang("django", {
	block: ["{#", "#}"],
})
