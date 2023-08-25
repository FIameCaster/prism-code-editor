import { languages } from "../core"
import { isBracketPair } from "./patterns"

const openBracketOrColon = /[([{][^\n)\]}]*$|:[ \t]*$/

languages.py = languages.python = {
	comments: {
		line: "#",
	},
	autoIndent: [
		([start], value) => openBracketOrColon.test(value.slice(0, start).slice(-999)),
		([start, end], value) => isBracketPair.test(value[start - 1] + value[end]),
	],
}
