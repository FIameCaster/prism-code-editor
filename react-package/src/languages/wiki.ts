import { languageMap } from ".."
import { markupLanguage, voidTags, xmlOpeningTag } from "./shared"

languageMap.wiki = markupLanguage(
	{
		block: ["/*", "*/"],
	},
	xmlOpeningTag,
	voidTags,
)
