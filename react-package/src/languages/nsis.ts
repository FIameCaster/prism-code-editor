import { languageMap } from ".."
import { bracketIndenting } from "./shared"

languageMap.nsis = bracketIndenting({
	line: "#",
	block: ["/*", "*/"],
})
