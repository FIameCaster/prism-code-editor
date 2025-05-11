import { languageMap } from ".."
import { bracketIndenting } from "./shared"

languageMap["go-mod"] = languageMap["go-module"] = bracketIndenting({
	line: "//",
})
