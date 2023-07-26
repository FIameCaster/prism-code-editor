import { EventHandler, Extension, PrismEditor, TokenizeEnv } from ".."
import { addEventHandler } from "../core"

const pairBrackets = (tokens: (Prism.Token | string)[]) => {
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
					// Adding opening bracket to the stack
					if (/[([{]/.test(content)) stack.push([position, token])
					// Finding a matching closing bracket
					else if (/[)\]}]/.test(content)) {
						let i = stack.length,
							found: boolean
						while (i) {
							const [position1, token1] = stack[--i]
							if (/\[]|\(\)|{}/.test(token1.content + content)) {
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

type BracketEventMap = {
	activeChange: (this: BracketMatcher, activePair: number) => any
}

export interface BracketMatcher extends Extension, EventHandler<BracketEventMap> {
	/** Array of the positions of all the brackets. */
	readonly pairPositions: number[][]
	/** Index of the highlighted pair of brackets or -1 if there's no highlight. */
	readonly activePair: number
	/** Gets the matching opening and closing brackets with the specified index if one exists. */
	getPair(index: number): [HTMLSpanElement, HTMLSpanElement] | undefined
}

/** Extension that matches brackets together and allows for rainbow brackets. */
export const matchBrackets = (): BracketMatcher => {
	let pairs: number[][] = [],
		secondOrder: number[][],
		activeID: number,
		prevPair: number[],
		currentEditor: PrismEditor,
		textarea: HTMLTextAreaElement,
		wrapper: HTMLDivElement,
		openingBrackets: HTMLCollectionOf<HTMLSpanElement>,
		closingBrackets: HTMLCollectionOf<HTMLSpanElement>

	const getActiveID = (offset: number) => {
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
			const newID = start == end && currentEditor.focused ? getActiveID(start) : -1
			if (prevPair == (prevPair = pairs[newID])) return
			toggleBrackets(activeID, false)
			toggleBrackets((activeID = newID), true)
			dispatch("activeChange", newID)
		},
		tokenize = (env: TokenizeEnv) => {
			if (env.language != "regex") {
				pairs = pairBrackets(env.tokens)
				secondOrder = pairs.slice().sort((a, b) => a[0] - b[0])
			}
		},
		[dispatch, self] = addEventHandler<BracketMatcher, BracketEventMap>({
			update(editor: PrismEditor) {
				if (!currentEditor) {
					;({ textarea, wrapper } = currentEditor = editor)

					openingBrackets = <HTMLCollectionOf<HTMLSpanElement>>(
						wrapper.getElementsByClassName("bracket-open")
					)
					closingBrackets = <HTMLCollectionOf<HTMLSpanElement>>(
						wrapper.getElementsByClassName("bracket-close")
					)

					let add = currentEditor.addListener
					textarea.addEventListener("blur", selectionChange)
					textarea.addEventListener("focus", selectionChange)
					add("selectionChange", selectionChange)
					add("tokenize", tokenize)

					if (editor.value) editor.update()
				}
			},
			getPair,
			get pairPositions() {
				return pairs
			},
			get activePair() {
				return activeID
			},
		})

	return self
}
