import { languages } from "../core"
import { isBracketPair } from "./patterns"

const openBracketOrColon = /[([{][^\n)\]}]*$|:[ \t]*$/

languages.py = languages.python = {
	comments: {
		line: "#",
	},
	autoIndent: [
		([start], value) => openBracketOrColon.test(value.substring(start - 999, start)),
		([start, end], value) => isBracketPair.test(value[start - 1] + value[end]),
	],
}
