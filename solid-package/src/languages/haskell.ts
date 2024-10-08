import { languageMap } from ".."
import { bracketIndenting } from "./shared"

languageMap.idr =
	languageMap.idris =
	languageMap.hs =
	languageMap.haskell =
	languageMap.purs =
	languageMap.purescript =
		bracketIndenting({
			line: "--",
			block: ["{-", "-}"],
		})
