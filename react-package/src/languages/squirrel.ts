import { languageMap } from ".."
import { bracketIndenting, clikeComment, clikeIndent } from "./shared"

languageMap.squirrel = bracketIndenting(clikeComment, clikeIndent)
