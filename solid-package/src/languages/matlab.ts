import { languageMap } from ".."
import { bracketIndenting } from "./shared"

languageMap.matlab = bracketIndenting({
	line: "%",
	block: ["%{", "}%"],
})
