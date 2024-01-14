/** @module match-brackets */

import { Extension } from "../.."
import { Token } from "../../prism/core"

const openingCharCodes: boolean[] = []
const closingCharCodes: boolean[] = []

export interface BracketMatcher extends Extension {
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

export type Bracket = [Token, number, number, string, boolean]

/**
 * Extension that matches brackets together.
 * @param rainbowBrackets Whether to add extra classes to brackets for styling. Defaults to true.
 * Adding the extension dynamically, will force a rerender to add those extra classes.
 *
 * Without rainbow brackets, this extension can be added dynamically with no side effects.
 */
export const matchBrackets = (rainbowBrackets = true): BracketMatcher => {
	let stack: [number, number][]
	let bracketIndex: number
	const brackets: Bracket[] = []
	const pairMap: number[] = []
	const matchBrackets = (obj: { tokens: (Token | string)[] }) => {
		stack = []
		pairMap.length = brackets.length = bracketIndex = 0
		matchRecursive(obj.tokens, 0)
		if (rainbowBrackets) {
			for (let i = 0, bracket: Bracket; (bracket = brackets[i]); ) {
				let alias = bracket[0].alias

				bracket[0].alias =
					(alias ? alias + " " : "") +
					`bracket-${pairMap[i++] == null ? "error" : "level-" + (bracket[2] % 12)}`
			}
		}
	}
	const matchRecursive = (tokens: (Token | string)[], position: number) => {
		for (let i = 0, token: string | Token; (token = tokens[i++]); ) {
			if (typeof token != "string") {
				const type = token.type,
					content = <string | (string | Token)[]>token.content

				if (type != "regex") {
					if (Array.isArray(content)) {
						matchRecursive(content, position)
					} else if ((token.alias || type) == "punctuation") {
						let charCode = content.charCodeAt(content.length - 1),
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
			}
			position += token.length
		}
	}

	return {
		update(editor) {
			this.update = () => {}
			editor.extensions.matchBrackets = this
			editor.addListener("tokenize", matchBrackets)
			if (rainbowBrackets && editor.tokens[0]) editor.update()
			else matchBrackets(editor)
		},
		brackets,
		pairs: pairMap,
	}
}

openingCharCodes[40] = openingCharCodes[91] = openingCharCodes[123] = true
closingCharCodes[41] = closingCharCodes[93] = closingCharCodes[125] = true
