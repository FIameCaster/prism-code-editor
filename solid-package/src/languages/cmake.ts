import { languageMap } from "../core"
import { bracketIndenting } from "./shared"

languageMap.cmake = bracketIndenting({ line: "#", block: ["#[[", "]]"] })
