import { languageMap } from ".."
import { bracketIndenting, clikeComment } from "./shared"

languageMap.g4 = languageMap.antlr4 = bracketIndenting(clikeComment)
