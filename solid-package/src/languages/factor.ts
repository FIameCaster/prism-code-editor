import { languageMap } from ".."
import { bracketIndenting } from "./shared"

languageMap.factor = bracketIndenting({
	line: "!",
	block: ["/*", "*/"],
})
