import { languageMap } from ".."
import { bracketIndenting } from "./shared"

languageMap.haml = bracketIndenting({ line: "-#" })
