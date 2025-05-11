import { languageMap } from ".."
import { bracketIndenting, clikeComment, clikeIndent } from "./shared"

languageMap.mongodb = bracketIndenting(clikeComment, clikeIndent)
