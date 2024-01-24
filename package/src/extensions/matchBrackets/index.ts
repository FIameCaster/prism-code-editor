/** @module match-brackets */

import { BasicExtension } from "../.."
import { Token, TokenStream } from "../../prism"

const openingCharCodes: boolean[] = []
const closingCharCodes: boolean[] = []

export interface BracketMatcher extends BasicExtension {
	/**
	 * Array of tuples containing in the following order:
	 * - The bracket's `Token`
	 * - Its starting position
	 * - Its level of nesting
	 * - Its text content
	 * - Whether it's an opening bracket
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
 */
export type Bracket = [Token, number, number, string, boolean]

/**
 * Extension that matches brackets together.
 * @param rainbowBrackets Whether to add extra classes to brackets for styling. Defaults to true.
 * Adding the extension dynamically, will force a rerender to add those extra classes.
 *
 * Without rainbow brackets, this extension can be added dynamically with no side effects.
 */
export const matchBrackets = (rainbowBrackets = true) => {
	let stack: [number, number][]
	let bracketIndex: number
	const self: BracketMatcher = editor => {
		editor.extensions.matchBrackets = self
		editor.addListener("tokenize", matchBrackets)
		if (rainbowBrackets && editor.tokens[0]) editor.update()
		else matchBrackets(editor.tokens)
	}
	// @ts-expect-error
	const brackets: Bracket[] = self.brackets = []
	// @ts-expect-error
	const pairMap: number[] = self.pairs = []
	const matchBrackets = (tokens: TokenStream) => {
		stack = []
		pairMap.length = brackets.length = bracketIndex = 0
		matchRecursive(tokens, 0)
		if (rainbowBrackets) {
			for (let i = 0, bracket: Bracket; (bracket = brackets[i]); ) {
				let alias = bracket[0].alias

				bracket[0].alias =
					(alias ? alias + " " : "") +
					`bracket-${pairMap[i++] == null ? "error" : "level-" + (bracket[2] % 12)}`
			}
		}
	}
	const matchRecursive = (tokens: TokenStream, position: number) => {
		for (let i = 0, token: string | Token; (token = tokens[i++]); ) {
			let length = token.length
			if (typeof token != "string") {
				const type = token.type,
					content = token.content

				if (Array.isArray(content)) {
					matchRecursive(content, position)
				} else if ((token.alias || type) == "punctuation") {
					let charCode = content.charCodeAt(length - 1),
						isOpen = !!openingCharCodes[charCode]
					if (isOpen || closingCharCodes[charCode]) {
						brackets[bracketIndex] = [token, position, 0, content, isOpen]

						if (isOpen) stack.push([bracketIndex, charCode])
						else {
							for (let i = stack.length; i; ) {
								let [index, charCode1] = stack[--i]
								if (charCode - charCode1 < 3 && charCode - charCode1 > 0) {
									pairMap[(pairMap[bracketIndex] = index)] = bracketIndex
									brackets[bracketIndex][2] = brackets[index][2] = stack.length = i
									break
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

openingCharCodes[40] = openingCharCodes[91] = openingCharCodes[123] = true
closingCharCodes[41] = closingCharCodes[93] = closingCharCodes[125] = true
