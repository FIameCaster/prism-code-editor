import { languageMap } from "../core"
import { bracketIndenting } from "./shared"

languageMap.yml = languageMap.yaml = bracketIndenting({ line: "#" })
