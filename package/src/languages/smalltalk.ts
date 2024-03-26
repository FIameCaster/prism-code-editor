import { languageMap } from ".."
import { bracketIndenting } from "./shared"

languageMap.smalltalk = bracketIndenting({
	block: ['"', '"'],
})
