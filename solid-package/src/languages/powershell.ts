import { languageMap } from ".."
import { bracketIndenting } from "./shared"

languageMap.powershell = bracketIndenting({
	line: "#",
	block: ["<#", "#>"],
})
