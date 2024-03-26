import { languageMap } from "../core"
import { bracketIndenting } from "./shared"

languageMap.plsql = languageMap.sql = bracketIndenting({
	line: "--",
	block: ["/*", "*/"],
})
