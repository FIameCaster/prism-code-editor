import { languageMap } from ".."
import { bracketIndenting } from "./shared"

languageMap.maxscript = bracketIndenting({
	line: "--",
	block: ["/*", "*/"],
})
