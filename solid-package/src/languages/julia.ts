import { languageMap } from ".."
import { bracketIndenting } from "./shared"

languageMap.julia = bracketIndenting({
	line: "#",
	block: ["#=", "=#"],
})
