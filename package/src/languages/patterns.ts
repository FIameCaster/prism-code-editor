const clikeIndent = /[([{][^\n)\]}]*$|(?:(?:^|[^.])\b(?:if\s*\(.+?\)|else|case.+?:))[ \t]*$/,
	isBracketPair = /\[]|\(\)|{}/,
	xmlOpeningTag =
		/<(?![!\d])([^\s>\/=$<%]+)(?:\s(?:\s*[^\s>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+))?)+)?\s*>[ \t]*$/,
	xmlClosingTag = /^<\/(?!\d)[^\s>\/=$<%]+\s*>/

export { clikeIndent, isBracketPair, xmlOpeningTag, xmlClosingTag }
