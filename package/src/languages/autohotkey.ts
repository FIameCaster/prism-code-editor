import { languageMap } from ".."
import { bracketIndenting } from "./shared"

languageMap.autohotkey = bracketIndenting({
	line: ";",
	block: ["/*", "*/"],
})
