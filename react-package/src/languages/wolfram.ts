import { languageMap } from ".."
import { bracketIndenting } from "./shared"

languageMap.nb =
	languageMap.wl =
	languageMap.mathematica =
	languageMap.wolfram =
		bracketIndenting({ block: ["(*", "*)"] })
