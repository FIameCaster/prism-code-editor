import { languageMap } from "../core"
import { isBracketPair } from "./patterns"

const openBracketOrColon = /[([{][^\n)\]}]*$|:[ \t]*$/

languageMap.py = languageMap.python = {
	comments: {
		line: "#",
	},
	autoIndent: [
		([start], value) => openBracketOrColon.test(value.slice(0, start)),
		([start, end], value) => isBracketPair.test(value[start - 1] + value[end]),
	],
}
