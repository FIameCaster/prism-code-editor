import { languageMap } from ".."
import { bracketIndenting, clikeComment, clikeIndent } from "./shared"

languageMap.objc = languageMap.objectivec = bracketIndenting(clikeComment, clikeIndent)
