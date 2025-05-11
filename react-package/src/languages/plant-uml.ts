import { languageMap } from ".."
import { bracketIndenting } from "./shared"

languageMap.plantuml = languageMap["plant-uml"] = bracketIndenting({
	line: "'",
	block: ["/'", "'/"],
})
