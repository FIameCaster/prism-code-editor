import { languageMap } from "../core"
import { bracketIndenting } from "./shared"

languageMap.json = languageMap.json5 = languageMap.jsonp = bracketIndenting()
