import { languageMap } from ".."
import { bracketIndenting, clikeComment, clikeIndent } from "./shared"

languageMap.uc =
	languageMap.uscript =
	languageMap.unrealscript =
		bracketIndenting(clikeComment, clikeIndent)
