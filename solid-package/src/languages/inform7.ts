import { languageMap } from ".."
import { bracketIndenting } from "./shared"

languageMap.inform7 = bracketIndenting({
	block: ["[", "]"],
})
