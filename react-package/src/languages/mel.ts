import { languageMap } from ".."
import { bracketIndenting, clikeComment, clikeIndent } from "./shared"

languageMap.mel = bracketIndenting(clikeComment, clikeIndent)
