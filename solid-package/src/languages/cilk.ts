import { languageMap } from ".."
import { bracketIndenting, clikeComment, clikeIndent } from "./shared"

languageMap["cilk-c"] =
	languageMap.cilkc =
	languageMap.cilk =
	languageMap["cilk-cpp"] =
	languageMap.cilkcpp =
		bracketIndenting(clikeComment, clikeIndent)
