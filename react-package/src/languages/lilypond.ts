import { languageMap } from ".."
import { bracketIndenting } from "./shared"

languageMap.ly = languageMap.lilypond = bracketIndenting({
	line: "%",
	block: ["%{", "%}"],
})
