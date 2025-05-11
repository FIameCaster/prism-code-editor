import { languageMap } from ".."
import { bracketIndenting } from "./shared"

languageMap.parigp = bracketIndenting({
	line: "\\\\",
	block: ["/*", "*/"],
})
