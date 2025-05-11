import { languageMap } from ".."
import { bracketIndenting } from "./shared"

languageMap.ocaml = bracketIndenting({
	block: ["(*", "*)"],
})
