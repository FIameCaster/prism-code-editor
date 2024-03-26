import { languageMap } from ".."
import { markupLanguage, voidTags, xmlOpeningTag } from "./shared"

languageMap.ejs = markupLanguage({ block: ["<%#", "%>"] }, xmlOpeningTag, voidTags)
