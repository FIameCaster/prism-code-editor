import { languageMap } from ".."
import { bracketIndenting } from "./shared"

languageMap.avs = languageMap.avisynth = bracketIndenting({
	line: "#",
	block: ["/*", "*/"],
})
