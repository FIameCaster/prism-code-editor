import { languageMap } from "../core"
import { bracketIndenting } from "./shared"

languageMap.abnf = bracketIndenting({ line: ";" })
