import { CommentTokens } from ".."
import { languageMap } from "../core"
import { Bracket, BracketMatcher } from "../extensions/matchBrackets"
import { Tag, TagMatcher } from "../extensions/matchTags"
import { getClosestToken } from "../utils"
import { clikeIndent, isBracketPair } from "./patterns"

const openingTag =
	/(?:^|[^\w$])<(?:(?!\d)([^\s>\/=<%]+)(?:(?:\s|\/\/.*(?!.)|\/\*(?:[^*]|\*(?!\/))*\*\/)+(?:[^\s{*<>\/=]+(?:(?:\s|\/\/.*(?!.)|\/\*(?:[^*]|\*(?!\/))*\*\/)*=\s*(?:"[^"]*"|'[^']*'|[^\s{'"\/>=]+|(?:\{(?:\{(?:\{[^{}]*\}|[^{}])*\}|[^{}])*\})))?|(?:\{(?:\s|\/\/.*(?!.)|\/\*(?:[^*]|\*(?!\/))*\*\/)*\.{3}(?:[^{}]|(?:\{(?:\{(?:\{[^{}]*\}|[^{}])*\}|[^{}])*\}))*\})))*(?:\s|\/\/.*(?!.)|\/\*(?:[^*]|\*(?!\/))*\*\/)*)?>[ \t]*$/

const closingTag = /^<\/(?!\d)[^\s>\/=<%]*\s*>/

const inJsxContext = (
	{ tags, pairs }: TagMatcher,
	{ brackets, pairs: bracketPairs }: BracketMatcher,
	position: number,
) => {
	for (let i = tags.length, tag: Tag, min = 0; (tag = tags[--i]); ) {
		if (tag[2] > position && tag[1] < position) min = tag[1]
		else if (
			!tag[4] &&
			!tag[5] &&
			tag[1] >= min &&
			tag[2] <= position &&
			!(tags[pairs[i]!]?.[1] < position)
		) {
			for (let i = brackets.length, bracket: Bracket; (bracket = brackets[--i]); ) {
				if (
					bracket[1] >= tag[2] &&
					bracket[1] < position &&
					bracket[3] == "{" &&
					!(brackets[bracketPairs[i]!]?.[1] < position)
				) {
					return
				}
			}
			return true
		}
	}
}

const jsComment: CommentTokens = {
	line: "//",
	block: ["/*", "*/"],
}

const jsxComment: CommentTokens = {
	block: ["{/*", "*/}"],
}

languageMap.jsx = languageMap.tsx = {
	comments: jsComment,
	getComments(editor, position) {
		const { matchBrackets, matchTags } = editor.extensions
		const inJsx =
			matchBrackets && matchTags
				? inJsxContext(matchTags, matchBrackets, position)
				: getClosestToken(editor, ".plain-text", 0, 0, position)
		return inJsx ? jsxComment : jsComment
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
