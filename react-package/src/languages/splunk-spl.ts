import { languageMap } from ".."
import { bracketIndenting } from "./shared"

languageMap["splunk-spl"] = bracketIndenting({
	block: ['`comment("', '")`'],
})
