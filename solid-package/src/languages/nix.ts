import { languageMap } from ".."
import { bracketIndenting } from "./shared"

languageMap.nix = bracketIndenting({
	line: "#",
	block: ["/*", "*/"],
})
