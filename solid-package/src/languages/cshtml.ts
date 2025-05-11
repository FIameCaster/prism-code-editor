import { languageMap } from "../core"
import { markupLanguage, voidTags, xmlOpeningTag } from "./shared"

languageMap.razor = languageMap.cshtml = markupLanguage(
	{ block: ["@*", "*@"] },
	xmlOpeningTag,
	voidTags,
)
