import { languageMap } from ".."
import { bracketIndenting } from "./shared"

languageMap.nani = languageMap.naniscript = bracketIndenting({
	line: ";",
})
