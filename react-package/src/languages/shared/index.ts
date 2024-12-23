import { CommentTokens, InputSelection, Language, PrismEditor, languageMap } from "../.."
import { getClosestToken, getLineBefore } from "../../utils"

const clikeIndent = /[([{][^)\]}]*$|^[^.]*\b(?:case .+?|default):\s*$/
const isBracketPair = /\[]|\(\)|{}/
const xmlOpeningTag =
	/<(?![?!\d#@])([^\s/=>$<%]+)(?:\s(?:\s*[^\s/"'=>]+(?:\s*=\s*(?!\s)(?:"[^"]*"|'[^']*'|[^\s"'=>]+(?=[\s>]))?|(?=[\s/>])))+)?\s*>[ \t]*$/
const xmlClosingTag = /^<\/(?!\d)[^\s/=>$<%]+\s*>/
const openBracket = /[([{][^)\]}]*$/

const testBracketPair = ([start, end]: InputSelection, value: string) => {
	return isBracketPair.test(value[start - 1] + value[end])
}

const clikeComment: CommentTokens = {
	line: "//",
	block: ["/*", "*/"],
}

const voidTags = /^(?:area|base|w?br|col|embed|hr|img|input|link|meta|source|track)$/i

const isOpen = (match: RegExpMatchArray | null, voidTags?: RegExp) =>
	!!match && !voidTags?.test(match[1])

const htmlAutoIndent = (tagPattern: RegExp, voidTags?: RegExp): Language["autoIndent"] => [
	([start], value) =>
		isOpen(value.slice(0, start).match(tagPattern), voidTags) ||
		openBracket.test(getLineBefore(value, start)),
	(selection, value) =>
		testBracketPair(selection, value) ||
		(isOpen(value.slice(0, selection[0]).match(tagPattern), voidTags) &&
			xmlClosingTag.test(value.slice(selection[1]))),
]

const markupComment: CommentTokens = {
	block: ["<!--", "-->"],
}

const markupLanguage = (
	comment = markupComment,
	tagPattern = xmlOpeningTag,
	voidTags?: RegExp,
): Language => ({
	comments: comment,
	autoIndent: htmlAutoIndent(tagPattern, voidTags),
	autoCloseTags: ([start, end], value, editor) => {
		return autoCloseTags(editor, start, end, value, tagPattern, voidTags)
	},
})

const autoCloseTags = (
	editor: PrismEditor,
	start: number,
	end: number,
	value: string,
	tagPattern: RegExp,
	voidTags?: RegExp,
) => {
	if (start == end) {
		let match: string | RegExpExecArray | null = tagPattern.exec(value.slice(0, start) + ">")
		let tagMatcher = editor.extensions.matchTags
		if (match && ((match = match[1] || ""), !voidTags?.test(match))) {
			if (tagMatcher) {
				let { pairs, tags } = tagMatcher
				for (let i = tags.length; i; ) {
					let tag = tags[--i]
					if (tag[1] >= start && tag[4] && tag[5] && tag[3] == match && pairs[i] == null) {
						return
					}
				}
			}
			return `</${match}>`
		}
	}
}

const bracketIndenting = (comments = clikeComment, indentPattern = openBracket): Language => ({
	comments,
	autoIndent: [
		([start], value) => indentPattern.test(getLineBefore(value, start)),
		testBracketPair,
	],
})

const markupTemplateLang = (name: string, comments: CommentTokens): Language =>
	(languageMap[name] = {
		comments,
		autoIndent: htmlAutoIndent(xmlClosingTag, voidTags),
		autoCloseTags: ([start, end], value, editor) => {
			return getClosestToken(editor, "." + name, 0, 0, start)
				? ""
				: autoCloseTags(editor, start, end, value, xmlOpeningTag, voidTags)
		},
	})

export {
	clikeIndent,
	isBracketPair,
	xmlOpeningTag,
	xmlClosingTag,
	openBracket,
	autoCloseTags,
	testBracketPair,
	clikeComment,
	bracketIndenting,
	htmlAutoIndent,
	voidTags,
	markupTemplateLang,
	markupLanguage,
	markupComment,
}
