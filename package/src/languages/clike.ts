import { languages } from "../index.js"
import { Language } from "../types"

const hasOpenBracket = /[([{][^\n)\]}]*$/
const isBracketGroup = /\[]|\(\)|{}/

const clike: Language = {
	comments: {
		line: "//",
		block: ["/*", "*/"],
	},
	autoIndent: [
		([start], value) => hasOpenBracket.test(value.slice(0, start)),
		([start, end], value) => isBracketGroup.test(value[start - 1] + value[end]),
	],
}

for (const lang of [
	"clike",
	"js",
	"javascript",
	"ts",
	"typescript",
	"java",
	"cs",
	"csharp",
	"c",
	"cpp",
]) {
	languages[lang] = clike
}
