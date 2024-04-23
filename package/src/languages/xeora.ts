import { languageMap } from ".."
import { markupComment, markupLanguage, voidTags, xmlOpeningTag } from "./shared"

languageMap.xeoracube = languageMap.xeora = markupLanguage(markupComment, xmlOpeningTag, voidTags)
