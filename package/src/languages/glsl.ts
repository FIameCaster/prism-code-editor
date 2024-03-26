import { languageMap } from ".."
import { bracketIndenting, clikeComment, clikeIndent } from "./shared"

languageMap.glsl = languageMap.hlsl = bracketIndenting(clikeComment, clikeIndent)
