import { languages } from "../index.js"

const openingTag =
	/(?:^|[^\w$]|(?=<\/))(?:<(?:([\w.:-]+)(?:(?:\s|\/\/.*(?!.)|\/\*(?:[^*]|\*(?!\/))\*\/)+(?:[\w.:$-]+(?:=(?:"(?:\\[\s\S]|[^\\"])*"|'(?:\\[\s\S]|[^\\'])*'|[^\s{'"\/>=]+|(?:\{(?:\{(?:\{[^{}]*\}|[^{}])*\}|[^{}])*\})))?|(?:\{(?:\s|\/\/.*(?!.)|\/\*(?:[^*]|\*(?!\/))\*\/)*\.{3}(?:[^{}]|(?:\{(?:\{(?:\{[^{}]*\}|[^{}])*\}|[^{}])*\}))*\})))*(?:\s|\/\/.*(?!.)|\/\*(?:[^*]|\*(?!\/))\*\/)*)?>)[ \t]*$/
const closingTag = /^<\/[\w.:-]*\s*>/
const hasOpenBracket = /[([{][^\n)\]}]*$/
const isBracketGroup = /\[]|\(\)|{}/

languages.jsx = languages.tsx = {
	comments: {
		line: "//",
		block: ["/*", "*/"],
	},
	autoIndent: [
		([start], value) =>
			hasOpenBracket.test(value.slice(0, start)) || openingTag.test(value.slice(0, start)),
		([start, end], value) =>
			isBracketGroup.test(value[start - 1] + value[end]) ||
			(openingTag.test(value.slice(0, start)) && closingTag.test(value.slice(end))),
	],
	autoCloseTags([start, end], value) {
		const match = start == end ? (value.slice(0, start) + ">").match(openingTag) : null
		return match != null ? `</${match[1] || ""}>` : ""
	},
}
