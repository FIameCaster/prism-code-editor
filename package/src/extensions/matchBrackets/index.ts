/** @module match-brackets */

import { BasicExtension } from "../../index.js"
import { Token, TokenStream } from "../../prism/index.js"

export interface BracketMatcher extends BasicExtension {
	/**
	 * Array of tuples containing in the following order:
	 * - The bracket's `Token`
	 * - Its starting position
	 * - Its level of nesting
	 * - Its text content
	 * - Whether it's an opening bracket
	 * - Its ending position
	 *
	 * The order will likely change in the next major release
	 */
	readonly brackets: Bracket[]
	/** Array mapping the index of a bracket to the index of its matching bracket. */
	readonly pairs: (number | undefined)[]
}

/**
 * Tuple containing in the following order:
 * - The bracket's `Token`
 * - Its starting position
 * - Its level of nesting
 * - Its text content
 * - Whether it's an opening bracket
 * - Its ending position
 *
 * The order will likely change in the next major release
 */
export type Bracket = [Token, number, number, string, boolean, number]

/**
 * Extension that matches punctuation tokens together. Intended for matching brackets.
 *
 * The order inside `openingBrackets` and `closingBrackets` determines which characters
 * are matched together.
 * @param rainbowBrackets Whether to add extra classes to brackets for styling. Defaults to true.
 * @param openingBrackets Defaults to `"([{"`.
 * @param closingBrackets Defaults to `")]}"`.
 *
 * Adding the extension dynamically, will force a rerender to add those extra classes.
 *
 * Without rainbow brackets, this extension can be added dynamically with no side effects.
 */
export const matchBrackets = (
	rainbowBrackets = true,
	openingBrackets = "([{",
	closingBrackets = ")]}",
) => {
	let bracketIndex: number
	let sp: number
	const stack: [number, number][] = []
	const self: BracketMatcher = editor => {
		editor.extensions.matchBrackets = self
		editor.addListener("tokenize", matchBrackets)
		if (rainbowBrackets && editor.tokens[0]) editor.update()
		else matchBrackets(editor.tokens)
	}
	// @ts-expect-error
	const brackets: Bracket[] = (self.brackets = [])
	// @ts-expect-error
	const pairMap: number[] = (self.pairs = [])
	const matchBrackets = (tokens: TokenStream) => {
		pairMap.length = brackets.length = sp = bracketIndex = 0
		matchRecursive(tokens, 0)

		if (rainbowBrackets) {
			for (let i = 0, bracket: Bracket; (bracket = brackets[i]); ) {
				let alias = bracket[0].alias

				bracket[0].alias =
					(alias ? alias + " " : "") +
					`bracket-${i++ in pairMap ? "level-" + (bracket[2] % 12) : "error"}`
			}
		}
	}
	const matchRecursive = (tokens: TokenStream, position: number) => {
		let token: string | Token
		let i = 0
		for (; (token = tokens[i++]); ) {
			let length = token.length
			if (typeof token != "string") {
				let content = token.content

				if (Array.isArray(content)) {
					matchRecursive(content, position)
				} else if ((token.alias || token.type) == "punctuation") {
					let openingType = testBracket(content, openingBrackets, length - 1)
					let closingType = openingType || testBracket(content, closingBrackets, length - 1)
					if (closingType) {
						brackets[bracketIndex] = [token, position, 0, content, !!openingType, position + length]

						if (openingType) stack[sp++] = [bracketIndex, openingType]
						else {
							for (let i = sp; i; ) {
								let [index, type] = stack[--i]
								if (closingType == type) {
									pairMap[(pairMap[bracketIndex] = index)] = bracketIndex
									brackets[bracketIndex][2] = brackets[index][2] = sp = i
									i = 0
								}
							}
						}
						bracketIndex++
					}
				}
			}
			position += length
		}
	}

	return self
}

const testBracket = (str: string, brackets: string, l: number) => {
	return brackets.indexOf(str[0]) + 1 || (l && brackets.indexOf(str[l]) + 1)
}
