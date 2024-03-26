import { languageMap } from ".."
import { bracketIndenting, clikeComment, clikeIndent } from "./shared"

languageMap.n4jsd = languageMap.n4js = bracketIndenting(clikeComment, clikeIndent)
