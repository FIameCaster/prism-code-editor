import { languageMap } from "../core"
import { markupComment, markupLanguage, voidTags, xmlOpeningTag } from "./shared"

languageMap.markup =
	languageMap.html =
	languageMap.markdown =
	languageMap.md =
		markupLanguage(markupComment, xmlOpeningTag, voidTags)
