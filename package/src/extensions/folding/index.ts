import { Extension, PrismEditor, numLines } from "../.."
import { getLineBefore } from "../../utils"
import { createTemplate, languages } from "../../core"
import { BracketMatcher } from "../matchBrackets"
import { TagMatcher } from "../matchTags"

/** Callback used to add extra foldable ranges to an editor */
export type AddFoldRangesCallback = (
	editor: PrismEditor,
	currentFolds: [number, number][],
) => [number, number][]

export interface ReadOnlyCodeFolding extends Extension {
	readonly fullCode: string
	toggleFold(lineNumber: number, force?: boolean): void
}

const template = createTemplate("<div title='Fold line'> </div>", "", "fold-line-btn")
const template2 = createTemplate(" <span>   </span> ", "", "fold-placeholder")

/**
 * Extension only supporting read-only editors which adds code folding to the editor.
 * 
 * To fold XML elements, a tag matching extension needs to be added before.
 * 
 * To fold bracket pairs, a bracket matching extension needs to be added before.
 * 
 * @param addExtraFoldRanges Optional callback that can add extra foldable ranges.
 */
export const readOnlyCodeFolding = (
	addExtraFoldRanges?: AddFoldRangesCallback,
): ReadOnlyCodeFolding => {
	let matchTags: TagMatcher | undefined,
		matchBrackets: BracketMatcher | undefined,
		cEditor: PrismEditor,
		value: string,
		code = "",
		lines: HTMLCollection,
		folds: [number, number][],
		foldPositions: (undefined | [number, number])[],
		foldToggles: HTMLDivElement[],
		foldPlaceholders: HTMLDivElement[]

	const foldedLines = new Set<number>()
	const foldedRanges = new Set<[number, number]>()

	const getPosition = (pos: number) => {
		let result = pos
		for (let [start, end] of foldedRanges) {
			if (start < pos) {
				if (end > pos) return -1
				else result -= end - start - 3
			}
		}
		return result
	}

	const toggleFold = (line: number) => {
		const start = foldPositions[line]![0]
		const addFold = (line: number) => {
			let [start, end] = foldPositions[line]!
			let expanded: boolean
			for (let range of foldedRanges) {
				if (start <= range[0] && end > range[0]) {
					if (expanded!) foldedRanges.delete(range)
					else {
						range[0] = start
						if (end > range[1]) range[1] = end
						expanded = true
					}
				}
			}
			if (!expanded!) foldedRanges.add([start, end])
		}

		if (foldedLines.has(line)) {
			foldedLines.delete(line)
			for (let range of foldedRanges) {
				if (start == range[0]) {
					foldedRanges.delete(range)
					for (let currentLine of foldedLines) {
						const pos = foldPositions[currentLine]![0]
						if (pos > start) addFold(currentLine)
					}
					break
				}
			}
		} else {
			foldedLines.add(line)
			addFold(line)
		}
		value = ""
		let pos = 0,
			skippedLines: number[] = [],
			sortedRanges = [...foldedRanges].sort((a, b) => a[0] - b[0])

		for (let [start, end] of sortedRanges) {
			value += code.slice(pos, start) + "   "
			skippedLines[numLines(value)] = numLines(code, start, (pos = end))
		}

		cEditor.textarea.value = value += code.slice(pos)
		cEditor.textarea.dispatchEvent(new Event("input"))
		cEditor.setSelection(getPosition(start))

		for (let i = 1, j = 0, l = lines.length; i < l; i++)
			lines[i].setAttribute("data-line", <any>(j += skippedLines[i - 1] || 1))

		cEditor.scrollContainer.style.setProperty(
			"--number-width",
			Math.ceil(Math.log10(numLines(code))) + 0.001 + "ch",
		)

		updateFolds()
	}

	const updateFolds = () => {
		for (let line in foldPositions) {
			let pos = getPosition(foldPositions[line]![0])
			if (pos + 1) {
				let parent = lines[numLines(value, 0, pos)]
				let el = foldToggles[line]
				let isClosed = foldedLines.has(+line)
				if (!el) {
					el = foldToggles[line] = <HTMLDivElement>template.cloneNode(true)
					el.onclick = () => {
						toggleFold(+line)
					}
				}
				if (parent != el.parentNode && !parent.querySelector(".fold-line-btn")) parent.prepend(el)
				el.classList.toggle("closed-fold", isClosed)
				el = foldPlaceholders[line]
				if (isClosed) {
					if (!el) {
						el = foldPlaceholders[line] = <HTMLDivElement>template2.cloneNode(true)
					}
					const pos2 = getPosition(foldPositions[line]![1])
					const [before, placeholder, after] = <[Text, HTMLElement, Text]>(<any>el.childNodes)
					before.data = getLineBefore(value, pos)
					after.data = /.*/.exec(value.slice(pos2))![0]
					placeholder.onclick = () => {
						toggleFold(+line)
					}
					if (parent != el.parentNode) parent.prepend(el)
				} else el?.remove()
			}
		}
	}

	const findMultilineComments = (
		tokens: (Prism.Token | string)[],
		position: number,
		language = cEditor.options.language,
	) => {
		for (let i = 0, l = tokens.length; i < l; ) {
			const token = <Prism.Token>tokens[i++]
			const content = token.content
			const length = token.length
			const type = token.type
			if (type == "comment" && numLines(value, position, position + length) > 1) {
				let comment = languages[language]?.comments?.block
				if (comment)
					folds.push([position + comment[0].length, position + length - comment[1].length])
			} else if (Array.isArray(content))
				findMultilineComments(
					content,
					position,
					type.slice(0, 9) == "language-" ? type.slice(9) : language,
				)
			position += length
		}
	}

	const createFolds = () => {
		code = cEditor.options.value
		folds = []
		foldToggles = []
		foldPlaceholders = []
		foldPositions = []
		foldedRanges.clear()
		foldedLines.clear()
		value = cEditor.value
		findMultilineComments(cEditor.tokens, 0)
		;({ matchTags, matchBrackets } = cEditor.extensions)

		if (matchTags) {
			const { tags, pairs } = matchTags
			for (let i = 0, j: number, l = pairs.length; i < l; i++) {
				if ((j = pairs[i]!) > i && numLines(value, tags[i][3], tags[j][1]) > 1) {
					folds.push([tags[i][3], tags[j][1]])
				}
			}
		}
		if (matchBrackets) {
			const { brackets, pairs } = matchBrackets
			for (let i = 0, j: number, l = pairs.length; i < l; i++) {
				if (
					(j = pairs[i]!) > i &&
					brackets[i][3] != "(" &&
					numLines(value, brackets[i][1], brackets[j][1]) > 1
				) {
					folds.push([brackets[i][1] + brackets[i][3].length, brackets[j][1]])
				}
			}
		}
		if (addExtraFoldRanges) folds.push(...addExtraFoldRanges(cEditor, folds))

		for (let i = 0, l = folds.length; i < l; i++) {
			const [start, end] = folds[i],
				index = numLines(value, 0, start)

			if (!foldPositions[index] || end > foldPositions[index]![1])
				foldPositions[index] = [start, end]
		}
		updateFolds()
	}

	return {
		update(editor, options) {
			if (!cEditor) {
				cEditor = editor
				editor.extensions.codeFold = this
				lines = editor.wrapper.children
				if (editor.tokens[0]) createFolds()
			}
			editor.scrollContainer.style.setProperty(
				"--padding-left",
				options.lineNumbers == false
					? "calc(var(--padding-inline,.75em) + var(--number-spacing,.75em))"
					: "",
			)
			editor.addListener("update", createFolds)
			setTimeout(() => editor.removeListener("update", createFolds))
		},
		get fullCode() {
			return code
		},
		toggleFold(lineNumber, force) {
			if (foldPositions[lineNumber] && foldedLines.has(lineNumber) != force) toggleFold(lineNumber)
		},
	}
}
