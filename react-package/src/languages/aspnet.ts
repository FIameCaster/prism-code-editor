import { languageMap } from "../core"
import { markupLanguage, voidTags, xmlOpeningTag } from "./shared"

languageMap.aspnet = markupLanguage({ block: ["<%--", "--%>"] }, xmlOpeningTag, voidTags)
