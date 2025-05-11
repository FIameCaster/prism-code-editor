import { languageMap } from ".."
import { bracketIndenting } from "./shared"

languageMap.pascaligo = languageMap.objectpascal = languageMap.pascal = bracketIndenting({
	line: "//",
	block: ["(*", "*)"],
})
