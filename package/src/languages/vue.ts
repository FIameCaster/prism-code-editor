import { languageMap } from ".."
import { markupComment, markupLanguage, voidTags, xmlOpeningTag } from "./shared"

languageMap.vue = markupLanguage(markupComment, xmlOpeningTag, voidTags)
