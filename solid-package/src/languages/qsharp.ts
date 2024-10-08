import { languageMap } from ".."
import { bracketIndenting } from "./shared"

languageMap.qs = languageMap.qsharp = bracketIndenting({
	line: "//",
})
