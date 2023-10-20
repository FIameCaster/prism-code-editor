import { languageMap } from "../core"
import { clikeIndent, isBracketPair } from "./patterns"

const openingTag =
	/(?:^|[^\w$]|(?=<\/))(?:<(?:([\w.:-]+)(?:(?:\s|\/\/.*(?!.)|\/\*(?:[^*]|\*(?!\/))\*\/)+(?:[\w.:$-]+(?:=(?:"(?:\\[\s\S]|[^\\"])*"|'(?:\\[\s\S]|[^\\'])*'|[^\s{'"\/>=]+|(?:\{(?:\{(?:\{[^{}]*\}|[^{}])*\}|[^{}])*\})))?|(?:\{(?:\s|\/\/.*(?!.)|\/\*(?:[^*]|\*(?!\/))\*\/)*\.{3}(?:[^{}]|(?:\{(?:\{(?:\{[^{}]*\}|[^{}])*\}|[^{}])*\}))*\})))*(?:\s|\/\/.*(?!.)|\/\*(?:[^*]|\*(?!\/))\*\/)*)?>)[ \t]*$/

const closingTag = /^<\/[\w.:-]*\s*>/

languageMap.jsx = languageMap.tsx = {
	comments: {
		line: "//",
		block: ["/*", "*/"],
	},
	autoIndent: [
		([start], value) =>
			openingTag.test((value = value.substring(start - 999, start))) || clikeIndent.test(value),
		([start, end], value) =>
			isBracketPair.test(value[start - 1] + value[end]) ||
			(openingTag.test(value.substring(start - 999, start)) &&
				closingTag.test(value.slice(end, end + 999))),
	],
	autoCloseTags([start, end], value) {
		const match = start == end ? (value.slice(0, start) + ">").match(openingTag) : null
		return match != null ? `</${match[1] || ""}>` : ""
	},
}
