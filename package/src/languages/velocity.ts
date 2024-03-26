import { languageMap } from ".."
import { markupLanguage, voidTags, xmlOpeningTag } from "./shared"

languageMap.velocity = markupLanguage(
	{
		line: "##",
		block: ["#*", "*#"],
	},
	xmlOpeningTag,
	voidTags,
)
