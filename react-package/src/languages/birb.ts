import { languageMap } from ".."
import { bracketIndenting, clikeComment, clikeIndent } from "./shared"

languageMap.birb = bracketIndenting(clikeComment, clikeIndent)
