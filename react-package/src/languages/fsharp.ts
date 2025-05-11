import { languageMap } from "../core"
import { bracketIndenting } from "./shared"

languageMap.fsharp = bracketIndenting({ line: "//", block: ["(*", "*)"] })
