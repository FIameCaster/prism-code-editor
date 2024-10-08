import { languageMap } from ".."
import { bracketIndenting, clikeComment, clikeIndent } from "./shared"

languageMap.bison = bracketIndenting(clikeComment, clikeIndent)
