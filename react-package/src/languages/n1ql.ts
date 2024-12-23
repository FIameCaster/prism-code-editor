import { languageMap } from ".."
import { bracketIndenting } from "./shared"

languageMap.n1ql = bracketIndenting({
	line: "--",
	block: ["/*", "*/"],
})
