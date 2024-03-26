import { languageMap } from "../core"
import { markupLanguage, voidTags, clikeComment, xmlOpeningTag } from "./shared"

languageMap.razor = languageMap.cshtml = markupLanguage(clikeComment, xmlOpeningTag, voidTags)
