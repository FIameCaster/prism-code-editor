import { languages } from "../core"
import { clikeIndent, isBracketPair } from "./patterns"

const openingTag =
	/(?:^|[^\w$]|(?=<\/))(?:<(?:([\w.:-]+)(?:(?:\s|\/\/.*(?!.)|\/\*(?:[^*]|\*(?!\/))\*\/)+(?:[\w.:$-]+(?:=(?:"(?:\\[\s\S]|[^\\"])*"|'(?:\\[\s\S]|[^\\'])*'|[^\s{'"\/>=]+|(?:\{(?:\{(?:\{[^{}]*\}|[^{}])*\}|[^{}])*\})))?|(?:\{(?:\s|\/\/.*(?!.)|\/\*(?:[^*]|\*(?!\/))\*\/)*\.{3}(?:[^{}]|(?:\{(?:\{(?:\{[^{}]*\}|[^{}])*\}|[^{}])*\}))*\})))*(?:\s|\/\/.*(?!.)|\/\*(?:[^*]|\*(?!\/))\*\/)*)?>)[ \t]*$/

const closingTag = /^<\/[\w.:-]*\s*>/

languages.jsx = languages.tsx = {
	comments: {
		line: "//",
		block: ["/*", "*/"],
	},
	autoIndent: [
		([start], value) =>
			openingTag.test((value = value.slice(0, start).slice(-999))) || clikeIndent.test(value),
		([start, end], value) =>
			isBracketPair.test(value[start - 1] + value[end]) ||
			(openingTag.test(value.slice(0, start).slice(-999)) && closingTag.test(value.slice(end))),
	],
	autoCloseTags([start, end], value) {
		const match = start == end ? (value.slice(0, start) + ">").match(openingTag) : null
		return match != null ? `</${match[1] || ""}>` : ""
	},
}
