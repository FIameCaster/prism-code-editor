import { Extension, PrismEditor, TokenizeEnv } from ".."

const pairBrackets = (
	tokens: (Prism.Token | string)[],
	openingRegex: RegExp,
	closingRegex: RegExp,
	pairRegex: RegExp,
) => {
	let position = 0
	const stack: [number, Prism.Token][] = []
	const positions: number[][] = []
	const add = (token: Prism.Token, classes: string) => {
		let alias = token.alias
		token.alias = (alias ? (Array.isArray(alias) ? alias.join(" ") : alias) + " " : "") + classes
	}
	const matchPairs = (tokens: (Prism.Token | string)[]) => {
		for (let i = 0, l = tokens.length; i < l; i++) {
			const token = tokens[i]
			if (typeof token != "string") {
				const { content, type } = token

				if (Array.isArray(content)) {
					matchPairs(content)
					continue
				}
				if (
					typeof content == "string" &&
					(type == "punctuation" || token.alias == "punctuation") &&
					type != "regex"
				) {
					if (openingRegex.test(content)) stack.push([position, token])
					else if (closingRegex.test(content)) {
						let i = stack.length,
							found: boolean

						while (i) {
							const [position1, token1] = stack[--i]
							if (pairRegex.test(token1.content + content)) {
								for (let arr = stack.splice(i), j = 1; j < arr.length; )
									add(arr[j++][1], "bracket-error")
								if (position - position1 == 1) {
									token1.content += content
									token.content = ""
								}
								positions.push([position1, position])
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
	matchPairs(tokens)
	stack.forEach(item => add(item[1], "bracket-error"))
	return positions
}

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

/**
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
		update(editor: PrismEditor) {
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
				addListener("tokenize", (env: TokenizeEnv) => {
					if (env.language != "regex") {
						toggleBrackets(activeID, false)
						activeID = -1
						pairs = pairBrackets(env.tokens, openingRegex, closingRegex, pairRegex)
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
