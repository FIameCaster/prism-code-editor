import { languageMap } from ".."
import { bracketIndenting } from "./shared"

languageMap.gni = languageMap.gn = bracketIndenting({
	line: "#",
})
