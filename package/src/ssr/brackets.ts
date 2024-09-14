import { renderEditor } from "./index.js"
import { matchBrackets } from "../extensions/matchBrackets/index.js"
import { Token, TokenStream } from "../prism/index.js"

let stack: [Token, number][] = []
let sp: number

const addAlias = (token: Token, newAlias = "bracket-error") => {
	let alias = token.alias
	token.alias = (alias ? alias + " " : "") + newAlias
}

const matchRecursive = (tokens: TokenStream, openingBrackets: string, closingBrackets: string) => {
	let token: string | Token
	let i = 0
	for (; (token = tokens[i++]); ) {
		if (typeof token == "string") continue

		let content = token.content
		let alias = token.alias

		if (Array.isArray(content)) {
			matchRecursive(content, openingBrackets, closingBrackets)
		} else if ((alias || token.type) == "punctuation") {
			let last = token.length - 1
			let openingType = testBracket(content, openingBrackets, last)
			let bracketType = openingType || testBracket(content, closingBrackets, last)

			if (bracketType) {
				if (openingType) stack[sp++] = [token, openingType]
				else {
					let i = sp
					let found = false

					while (i) {
						let entry = stack[--i]
						if (bracketType == entry[1]) {
							let alias = "bracket-level-" + (i % 12)
							let j = i
							while (++j < sp) {
								addAlias(stack[j][0])
							}
							addAlias(token, alias)
							addAlias(entry[0], alias)
							sp = i
							i = 0
							found = true
						}
					}
					if (!found) addAlias(token)
				}
			}
		}
	}
}

/**
 * Function that runs the same bracket matching algorithm as the {@link matchBrackets}
 * extension. This is useful to add rainbow brackets outside an editor or with
 * {@link renderEditor}.
 *
 * The order inside `openingBrackets` and `closingBrackets` determines which characters
 * are matched together.
 *
 * @param openingBrackets Defaults to `"([{"`.
 * @param closingBrackets Defaults to `")]}"`.
 * @returns A function that accepts a token stream and adds extra classes to the brackets.
 */
const rainbowBrackets = (openingBrackets = "([{", closingBrackets = ")]}") => {
	return (tokens: TokenStream) => {
		sp = 0
		matchRecursive(tokens, openingBrackets, closingBrackets)
		stack = []
	}
}

const testBracket = (str: string, brackets: string, l: number) => {
	return brackets.indexOf(str[0]) + 1 || (l && brackets.indexOf(str[l]) + 1)
}

export { rainbowBrackets }
