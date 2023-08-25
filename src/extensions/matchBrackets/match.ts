import { Extension, PrismEditor } from "../.."

export interface BracketMatcher extends Extension {
	/** Array of the positions of all the brackets. */
	readonly pairPositions: number[][]
	/** Index of the highlighted pair of brackets or -1 if there's no highlight. */
	readonly activePair: number
	/** Gets the matching opening and closing brackets with the specified index if one exists. */
	getPair(index: number): [HTMLSpanElement, HTMLSpanElement] | undefined
	/** Gets the index of the closest pair that encloses the position. */
	getClosest(position: number): number
}

const openingCharCodes: boolean[] = []
const closingCharCodes: boolean[] = []
export const editorMatcherMap = new WeakMap<PrismEditor, BracketMatcherNew>()

export interface BracketMatcherNew extends Extension {
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
export const bracketMatcher = (rainbowBrackets?: boolean): BracketMatcherNew => {
	let initialized: boolean,
		brackets: Bracket[] = [],
		stack: [number, number][],
		bracketIndex: number,
		position: number,
		pairMap: number[] = [],
		matchBrackets = (obj: { tokens: (Prism.Token | string)[] }) => {
			pairMap = []
			brackets = []
			stack = []
			position = bracketIndex = 0
			matchRecursive(obj.tokens)
			if (rainbowBrackets) {
				for (let i = 0, bracket: Bracket; (bracket = brackets[i]); ) {
					let alias = bracket[0].alias

					bracket[0].alias =
						(alias ? ((<[]>alias).join?.(" ") || alias) + " " : "") +
						`bracket-${pairMap[i++] == null ? "error" : "level-" + (bracket[2] % 12)}`
				}
			}
		},
		matchRecursive = (tokens: (Prism.Token | string)[]) => {
			for (let i = 0, token: string | Prism.Token; (token = tokens[i++]); ) {
				if (typeof token != "string") {
					const type = token.type,
						content = <string | (string | Prism.Token)[]>token.content

					if (Array.isArray(content)) {
						matchRecursive(content)
						continue
					}
					if (type != "regex" && (token.alias || type) == "punctuation") {
						let charCode = content.charCodeAt(content.length - 1),
							isOpen = !!openingCharCodes[charCode]
						if (isOpen || closingCharCodes[charCode]) {
							brackets[bracketIndex] = [token, position, 0, content, isOpen]

							if (isOpen) stack.push([bracketIndex, charCode])
							else {
								for (let i = stack.length, charCode1: number, index: number; i; ) {
									;[index, charCode1] = stack[--i]
									if (charCode - charCode1 < 3&& charCode - charCode1 > 0) {
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

				editorMatcherMap.set(editor, this)
				editor.addListener("tokenize", matchBrackets)
				if (rainbowBrackets && editor.value) editor.update()
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

/**
 * @deprecated Kept for backwards compatibility. Will be removed.
 *
 * Extension that matches brackets together and allows for rainbow brackets.
 * @param openingRegex Regex matching opening brackets. Defaults to `/[[({]/`.
 * @param closingRegex Regex matching closing brackets. Defaults to `/[)\]}]/`.
 * @param pairRegex Regex matching all bracket pairs. Defaults to `/\[]|\(\)|{}/`.
 */
export const matchBrackets = (
	openingRegex = /[[({]/,
	closingRegex = /[)\]}]/,
	pairRegex = /\[]|\(\)|{}/,
): BracketMatcher => {
	let pairs: number[][] = [],
		secondOrder: number[][],
		activeID: number,
		currentEditor: PrismEditor,
		openingBrackets: HTMLCollectionOf<HTMLSpanElement>,
		closingBrackets: HTMLCollectionOf<HTMLSpanElement>

	const getClosest = (offset: number) => {
			for (let i = 0, l = pairs.length; i < l; i++) {
				if (pairs[i][1] > offset - 2 && pairs[i][0] <= offset) return i
			}
			return -1
		},
		getPair = (index: number): [HTMLSpanElement, HTMLSpanElement] | undefined =>
			pairs[index] && [openingBrackets[secondOrder.indexOf(pairs[index])], closingBrackets[index]],
		toggleBrackets = (id: number, state: boolean) =>
			getPair(id)?.forEach(el => el.classList.toggle("active-bracket", state)),
		selectionChange = () => {
			const [start, end] = currentEditor.getSelection()
			const newID = start == end && currentEditor.focused ? getClosest(start) : -1
			if (activeID != newID) {
				toggleBrackets(activeID, false)
				toggleBrackets((activeID = newID), true)
			}
		}

	return {
		update(editor) {
			if (!currentEditor) {
				const { textarea, wrapper, addListener } = (currentEditor = editor)
				const add = addEventListener.bind(textarea)

				openingBrackets = <HTMLCollectionOf<HTMLSpanElement>>(
					wrapper.getElementsByClassName("bracket-open")
				)

				closingBrackets = <HTMLCollectionOf<HTMLSpanElement>>(
					wrapper.getElementsByClassName("bracket-close")
				)

				add("blur", selectionChange)
				add("focus", selectionChange)
				addListener("selectionChange", selectionChange)
				addListener("tokenize", env => {
					if (env.language != "regex") {
						toggleBrackets(activeID, false)
						activeID = -1
						pairs = []
						let position = 0
						let stack: [number, Prism.Token][] = []
						let add = (token: Prism.Token, classes: string) => {
							let alias = token.alias
							token.alias =
								(alias ? (Array.isArray(alias) ? alias.join(" ") : alias) + " " : "") + classes
						}
						let matchPairs = (tokens: (Prism.Token | string)[]) => {
							for (let i = 0, l = tokens.length; i < l; i++) {
								const token = tokens[i]
								if (typeof token != "string") {
									const type = token.type,
										content = <string | (string | Prism.Token)[]>token.content

									if (Array.isArray(content)) {
										matchPairs(content)
										continue
									}
									if (type != "regex" && (type == "punctuation" || token.alias == "punctuation")) {
										if (openingRegex.test(content)) stack.push([position, token])
										else if (closingRegex.test(content)) {
											let i = stack.length,
												found: boolean

											while (i) {
												const [position1, token1] = stack[--i]
												if (pairRegex.test(token1.content + content)) {
													for (let arr = stack.splice(i), j = 1; j < arr.length; );
													// add(arr[j++][1], "bracket-error")
													if (position - position1 == 1) {
														token1.content += content
														token.content = ""
													}
													pairs.push([position1, position])
													add(token1, "bracket-open bracket-level-" + (i % 12))
													add(token, "bracket-close bracket-level-" + (i % 12))
													found = true
													break
												}
											}
											found! || add(token, "bracket-error")
										}
									}
								}
								position += token.length
							}
						}
						matchPairs(env.tokens)
						stack.forEach(item => add(item[1], "bracket-error"))
						secondOrder = pairs.slice().sort((a, b) => a[0] - b[0])
					}
				})

				if (editor.value) editor.update()
			}
		},
		getPair,
		getClosest,
		get pairPositions() {
			return pairs
		},
		get activePair() {
			return activeID
		},
	}
}

openingCharCodes[40] = openingCharCodes[91] = openingCharCodes[123] = true
closingCharCodes[41] = closingCharCodes[93] = closingCharCodes[125] = true
