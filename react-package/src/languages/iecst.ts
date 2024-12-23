import { languageMap } from ".."
import { bracketIndenting } from "./shared"

languageMap.iecst = bracketIndenting({
	line: "//",
	block: ["(*", "*)"],
})
