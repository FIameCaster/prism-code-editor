import { languageMap } from ".."
import { bracketIndenting } from "./shared"

languageMap.pbfasm = languageMap.purebasic = bracketIndenting({
	line: ";",
})
