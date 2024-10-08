import { languageMap } from ".."
import { bracketIndenting, clikeComment, clikeIndent } from "./shared"

languageMap.ino = languageMap.arduino = bracketIndenting(clikeComment, clikeIndent)
