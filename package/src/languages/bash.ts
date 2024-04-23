import { languageMap } from ".."
import { bracketIndenting } from "./shared"

languageMap.sh = languageMap.shell = languageMap.bash = bracketIndenting({ line: "#" })
