import { languageMap } from ".."
import { bracketIndenting, clikeComment, clikeIndent } from "./shared"

languageMap.gamemakerlanguage = languageMap.gml = bracketIndenting(clikeComment, clikeIndent)
