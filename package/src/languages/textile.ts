import { languageMap } from ".."
import { markupComment, markupLanguage, voidTags, xmlOpeningTag } from "./shared"

languageMap.textile = markupLanguage(markupComment, xmlOpeningTag, voidTags)
