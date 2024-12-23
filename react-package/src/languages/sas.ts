import { languageMap } from ".."
import { bracketIndenting } from "./shared"

languageMap.sas = bracketIndenting({
	block: ["/*", "*/"],
})
