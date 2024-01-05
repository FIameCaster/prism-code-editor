import { languageMap } from "../core"
import { clikeIndent, isBracketPair } from "./patterns"

const openingTag =
	/(?:^|[^\w$])<(?:(?!\d)([^\s>\/=<%]+)(?:(?:\s|\/\/.*(?!.)|\/\*(?:[^*]|\*(?!\/))*\*\/)+(?:[^\s{*<>\/=]+(?:(?:\s|\/\/.*(?!.)|\/\*(?:[^*]|\*(?!\/))*\*\/)*=\s*(?:"[^"]*"|'[^']*'|[^\s{'"\/>=]+|(?:\{(?:\{(?:\{[^{}]*\}|[^{}])*\}|[^{}])*\})))?|(?:\{(?:\s|\/\/.*(?!.)|\/\*(?:[^*]|\*(?!\/))*\*\/)*\.{3}(?:[^{}]|(?:\{(?:\{(?:\{[^{}]*\}|[^{}])*\}|[^{}])*\}))*\})))*(?:\s|\/\/.*(?!.)|\/\*(?:[^*]|\*(?!\/))*\*\/)*)?>[ \t]*$/

const closingTag = /^<\/(?!\d)[^\s>\/=<%]*\s*>/

languageMap.jsx = languageMap.tsx = {
	comments: {
		line: "//",
		block: ["/*", "*/"],
	},
	autoIndent: [
		([start], value) => openingTag.test((value = value.slice(0, start))) || clikeIndent.test(value),
		([start, end], value) =>
			isBracketPair.test(value[start - 1] + value[end]) ||
			(openingTag.test(value.slice(0, start)) && closingTag.test(value.slice(end))),
	],
	autoCloseTags([start, end], value) {
		const match = start == end && (value.slice(0, start) + ">").match(openingTag)
		return match ? `</${match[1] || ""}>` : ""
	},
}
