import { languageMap } from ".."
import { bracketIndenting, clikeComment, clikeIndent } from "./shared"

languageMap.vala = bracketIndenting(clikeComment, clikeIndent)
