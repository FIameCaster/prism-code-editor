import { languageMap } from ".."
import { bracketIndenting } from "./shared"

languageMap.oz = bracketIndenting({
	line: "%",
	block: ["/*", "*/"],
})
