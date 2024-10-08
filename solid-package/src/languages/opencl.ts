import { languageMap } from ".."
import { bracketIndenting, clikeComment, clikeIndent } from "./shared"

languageMap.opencl = bracketIndenting(clikeComment, clikeIndent)
