import { languageMap } from ".."
import { markupLanguage, voidTags, xmlOpeningTag } from "./shared"

languageMap.parser = markupLanguage(
	{
		line: "#",
		block: ["<!--", "-->"],
	},
	xmlOpeningTag,
	voidTags,
)
