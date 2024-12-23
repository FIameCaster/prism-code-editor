import { languageMap } from "../core"
import { bracketIndenting } from "./shared"

languageMap.rpy =
	languageMap.renpy =
	languageMap.py =
	languageMap.python =
		bracketIndenting({ line: "#" }, /[([{][^)\]}]*$|:\s*$/)
