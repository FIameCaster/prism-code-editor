import { languageMap } from ".."
import { bracketIndenting } from "./shared"

languageMap.hcl = bracketIndenting({
	line: "#",
	block: ["/*", "*/"],
})
