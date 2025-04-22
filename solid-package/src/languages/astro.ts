import { languageMap } from ".."
import { astroOpeningTag, markupComment, markupLanguage, voidTags } from "./shared"

languageMap.astro = markupLanguage(markupComment, astroOpeningTag, voidTags)
