import { languageMap } from "../core"
import { bracketIndenting } from "./shared"

languageMap.coffee = languageMap.coffeescript = bracketIndenting({
	line: "#",
	block: ["###", "###"],
})
