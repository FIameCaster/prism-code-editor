import { languageMap } from ".."
import { bracketIndenting } from "./shared"

languageMap.ebnf = bracketIndenting({
	block: ["(*", "*)"],
})
