import { PrismEditor } from ".."
import { TagMatcher } from "../extensions/matchTags"

const clikeIndent = /[([{][^\n)\]}]*$|(?:(?:^|[^.])\b(?:if\s*\(.+?\)|else|case.+?:))[ \t]*$/,
	isBracketPair = /\[]|\(\)|{}/,
	xmlOpeningTag =
		/<(?![!\d])([^\s>\/=$<%]+)(?:\s(?:\s*[^\s>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))|(?=[\s/>])))+)?\s*>[ \t]*$/,
	xmlClosingTag = /^<\/(?!\d)[^\s>\/=$<%]+\s*>/,
	openBracket = /[([{][^\n)\]}]*$/

const hasMatchingClosingTag = (
	position: number,
	name: string,
	tagMatcher: TagMatcher | undefined,
) => {
	if (tagMatcher) {
		let { pairs, tags } = tagMatcher
		for (let i = tags.length; i; ) {
			let tag = tags[--i]
			if (tag[1] >= position && tag[4] && tag[5] && tag[3] == name && pairs[i] == null) {
				return true
			}
		}
	}
}

const autoCloseTags = (
	editor: PrismEditor,
	start: number,
	end: number,
	value: string,
	tagPattern: RegExp,
	voidTags?: RegExp,
) => {
	const tagName = start == end && (value.slice(0, start) + ">").match(tagPattern)?.[1]
	if (
		tagName &&
		!voidTags?.test(tagName) &&
		!hasMatchingClosingTag(start, tagName, editor.extensions.matchTags)
	) {
		return `</${tagName}>`
	}
}

export { clikeIndent, isBracketPair, xmlOpeningTag, xmlClosingTag, openBracket, autoCloseTags }
