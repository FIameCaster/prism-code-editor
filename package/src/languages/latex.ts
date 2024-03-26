import { languageMap } from ".."
import { bracketIndenting } from "./shared"

languageMap.context = languageMap.tex = languageMap.latex = bracketIndenting({ line: "%" })
