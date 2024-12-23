import { languageMap } from ".."
import { bracketIndenting } from "./shared"

languageMap.moon = languageMap.moonscript = bracketIndenting({
	line: "--",
})
