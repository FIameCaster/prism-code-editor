import { languageMap } from ".."
import { bracketIndenting } from "./shared"

languageMap.dhall = bracketIndenting({
	line: "--",
	block: ["{-", "-}"],
})
