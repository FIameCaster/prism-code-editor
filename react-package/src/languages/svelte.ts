import { languageMap } from ".."
import { astroOpeningTag, markupComment, markupLanguage, voidTags } from "./shared"

languageMap.svelte = markupLanguage(markupComment, astroOpeningTag, voidTags)
