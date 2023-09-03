import { Extension } from "../.."

const openingCharCodes: boolean[] = []
const closingCharCodes: boolean[] = []

export interface BracketMatcher extends Extension {
	/**
	 * Array of tuples containing:
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

export type Bracket = [Prism.Token, number, number, string, boolean]

/**
 * Extension that matches brackets together.
 * @param rainbowBrackets If true, extra classes are added to brackets for styling.
 * Adding the extension dynamically, will force a rerender to apply those extra classes.
 *
 * Without rainbow brackets, this extension can be added dynamically with no side effects.
 */
export const matchBrackets = (rainbowBrackets?: boolean): BracketMatcher => {
	let initialized: boolean,
		brackets: Bracket[] = [],
		stack: [number, number][],
		bracketIndex: number,
		pairMap: number[] = [],
		matchBrackets = (obj: { tokens: (Prism.Token | string)[] }) => {
			pairMap = []
			brackets = []
			stack = []
			bracketIndex = 0
			matchRecursive(obj.tokens, 0)
			if (rainbowBrackets) {
				for (let i = 0, bracket: Bracket; (bracket = brackets[i]); ) {
					let alias = bracket[0].alias

					bracket[0].alias =
						(alias ? ((<[]>alias).join?.(" ") || alias) + " " : "") +
						`bracket-${pairMap[i++] == null ? "error" : "level-" + (bracket[2] % 12)}`
				}
			}
		},
		matchRecursive = (tokens: (Prism.Token | string)[], position: number) => {
			for (let i = 0, token: string | Prism.Token; (token = tokens[i++]); ) {
				if (typeof token != "string") {
					const type = token.type,
						content = <string | (string | Prism.Token)[]>token.content

					if (Array.isArray(content)) {
						matchRecursive(content, position)
					}
					else if (type != "regex" && (token.alias || type) == "punctuation") {
						let charCode = content.charCodeAt(content.length - 1),
							isOpen = !!openingCharCodes[charCode]
						if (isOpen || closingCharCodes[charCode]) {
							brackets[bracketIndex] = [token, position, 0, content, isOpen]

							if (isOpen) stack.push([bracketIndex, charCode])
							else {
								for (let i = stack.length, charCode1: number, index: number; i; ) {
									;[index, charCode1] = stack[--i]
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
				position += token.length
			}
		}

	return {
		update(editor) {
			if (!initialized) {
				initialized = true

				editor.extensions.matchBrackets = this
				editor.addListener("tokenize", matchBrackets)
				if (rainbowBrackets && editor.tokens[0]) editor.update()
				else matchBrackets(editor)
			}
		},
		get brackets() {
			return brackets
		},
		get pairs() {
			return pairMap
		},
	}
}

openingCharCodes[40] = openingCharCodes[91] = openingCharCodes[123] = true
closingCharCodes[41] = closingCharCodes[93] = closingCharCodes[125] = true
