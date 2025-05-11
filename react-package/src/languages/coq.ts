import { languageMap } from "../core"
import { bracketIndenting } from "./shared"

languageMap.coq = bracketIndenting({ block: ["(*", "*)"] })
