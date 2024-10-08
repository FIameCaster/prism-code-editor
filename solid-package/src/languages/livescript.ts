import { languageMap } from ".."
import { bracketIndenting } from "./shared"

languageMap.livescript = bracketIndenting({
	line: "#",
	block: ["/*", "*/"],
})
