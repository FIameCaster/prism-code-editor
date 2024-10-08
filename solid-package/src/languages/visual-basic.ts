import { languageMap } from ".."
import { bracketIndenting } from "./shared"

languageMap.vba = languageMap.vb = languageMap["visual-basic"] = bracketIndenting({
	line: "'",
})
