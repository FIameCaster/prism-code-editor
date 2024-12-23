import { languageMap } from ".."
import { bracketIndenting } from "./shared"

languageMap.prolog = bracketIndenting({
	line: "%",
	block: ["/*", "*/"],
})
