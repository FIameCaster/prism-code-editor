import { languages } from "../index.js"

const openBracketOrColon = /[([{][^\n)\]}]*$|:[ \t]*$/
const isBracketGroup = /\[]|\(\)|{}/

languages.py = languages.python = {
	comments: {
		line: "#",
	},
	autoIndent: [
		([start], value) => openBracketOrColon.test(value.slice(0, start)),
		([start, end], value) => isBracketGroup.test(value[start - 1] + value[end]),
	],
}
