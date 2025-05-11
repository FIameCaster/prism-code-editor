import { languageMap } from ".."
import { bracketIndenting } from "./shared"

languageMap.ld = languageMap["linker-script"] = bracketIndenting({
	block: ["/*", "*/"],
})
