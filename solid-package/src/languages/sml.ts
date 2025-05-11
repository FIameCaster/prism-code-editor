import { languageMap } from ".."
import { bracketIndenting } from "./shared"

languageMap.smlnj = languageMap.sml = bracketIndenting({
	block: ["(*", "*)"],
})
