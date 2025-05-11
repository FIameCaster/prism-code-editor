import { languageMap } from ".."
import { bracketIndenting } from "./shared"

languageMap.rq =
	languageMap.sparql =
	languageMap.trig =
	languageMap.turtle =
		bracketIndenting({ line: "#" })
