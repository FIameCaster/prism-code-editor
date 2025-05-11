import { languageMap } from "../core"
import { markupLanguage } from "./shared"

// Same as HTML, but without void tags
languageMap.xml =
	languageMap.ssml =
	languageMap.atom =
	languageMap.rss =
	languageMap.mathml =
	languageMap.svg =
		markupLanguage()
