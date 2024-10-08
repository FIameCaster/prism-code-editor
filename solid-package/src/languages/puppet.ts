import { languageMap } from ".."
import { bracketIndenting } from "./shared"

languageMap.puppet = bracketIndenting({
	line: "#",
	block: ["/*", "*/"],
})
