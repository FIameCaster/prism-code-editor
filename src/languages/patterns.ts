const clikeIndent = /[([{][^\n)\]}]*$|((^|[^.])\b(if\s*\(.+?\)|else|case.+?:))[ \t]*$/,
	isBracketPair = /\[]|\(\)|{}/,
	xmlOpeningTag =
		/<(?!\d)([^\s>\/=$<%]+)(?:\s(?:\s*[^\s>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))|(?=[\s/>])))+)?\s*>[ \t]*$/,
	xmlClosingTag = /^<\/(?!\d)[^\s>\/=$<%]+\s*>/

export { clikeIndent, isBracketPair, xmlOpeningTag, xmlClosingTag }

switch (1 + 1) {
  case 2 ?
   3 : 2:

}
