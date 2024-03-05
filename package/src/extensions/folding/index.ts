/** @module code-folding */

import { Extension, PrismEditor, numLines } from "../../index.js"
import { getLineBefore } from "../../utils/index.js"
import { createTemplate, languageMap } from "../../core.js"
import { BracketMatcher } from "../matchBrackets/index.js"
import { TagMatcher } from "../matchTags.js"
import { TokenStream, Token } from "../../prism/index.js"

/**
 * Callback used to add extra foldable ranges to an editor.
 * @param editor Editor the folding ranges are added to.
 * @param currentFolds The ranges that are currently foldable.
 * @returns An array of extra foldable ranges.
 */
export type FoldingRangeProvider = (
	editor: PrismEditor,
	currentFolds: [number, number][],
) => [number, number][]

export interface ReadOnlyCodeFolding extends Extension {
	/** The code in the editor with no ranges collapsed. */
	readonly fullCode: string
	/**
	 * Toggles whether a range is folded. Does not cause a rerender so it's possible to
	 * toggle multiple folds simultaneously.
	 * @param lineNumber The line number of the fold.
	 * @param force If set to `true`, the range will only be folded.
	 * If `false`, the range will only be unfolded.
	 * If `undefined`, it will be toggled.
	 * @returns A boolean indicating whether or not a fold was toggled which means
	 * calling {@link updateFolds} in the near future is necessary.
	 */
	toggleFold(lineNumber: number, force?: boolean): boolean
	/** Call this after the {@link toggleFold} method to rerender the editor. */
	updateFolds(): void
}

const template = createTemplate('<div class="pce-fold"><div> ')
const template2 = createTemplate('<div class="pce-unfold"> <span title="Unfold">   </span> ')

const isMultiline = (str: string, start: number, end: number) =>
	str.slice(start, end).includes("\n")

/**
 * Extension only supporting read-only editors which adds code folding to the editor.
 *
 * To fold XML elements, a {@link TagMatcher} needs to be added before.
 *
 * To fold bracket pairs, a {@link BracketMatcher} needs to be added before.
 *
 * @param providers Callbacks that can add extra foldable ranges.
 * Very minimal downsides to adding this extension dynamically.
 */
const readOnlyCodeFolding = (...providers: FoldingRangeProvider[]): ReadOnlyCodeFolding => {
	let cEditor: PrismEditor,
		value: string,
		code: string,
		lines: HTMLCollection,
		lineNumberWidth: string,
		textarea: HTMLTextAreaElement,
		foldPositions: (undefined | [number, number])[],
		foldToggles: HTMLDivElement[],
		foldPlaceholders: HTMLDivElement[]

	const foldedLines = new Set<number>()
	const foldedRanges = new Set<[number, number]>()

	const getPosition = (pos: number) => {
		let result = pos
		for (let [start, end] of foldedRanges) {
			if (pos > start) {
				if (pos < end) return -1
				result -= end - start - 3
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
	}

	const update = (line?: number) => {
		value = ""
		let pos = 0,
			ln = 1,
			skippedLines: number[] = [],
			sortedRanges = [...foldedRanges].sort((a, b) => a[0] - b[0])


		for (let [start, end] of sortedRanges) {
			value += code.slice(pos, start) + "   "
			skippedLines[(ln += numLines(code, pos, start) - 1)] = numLines(code, start, (pos = end))
		}

		textarea.value = value += code.slice(pos)
		if (line) textarea.setSelectionRange(pos = getPosition(foldPositions[line]![0]), pos)
		textarea.dispatchEvent(new Event("input"))

		for (let i = 1, j = 0, l = lines.length; i < l; i++)
			lines[i].setAttribute("data-line", <any>(j += skippedLines[i - 1] || 1))

		cEditor.scrollContainer.style.setProperty("--number-width", lineNumberWidth)
		updateFolds()
	}

	const updateFolds = () => {
		for (let line = 0, l = foldPositions.length; line < l; line++) {
			if (!foldPositions[line]) continue
			let pos = getPosition(foldPositions[line]![0])
			if (pos + 1) {
				let parent = lines[numLines(value, 0, pos)]
				let el = foldToggles[line]
				let isClosed = foldedLines.has(line)
				if (!el) {
					el = foldToggles[line] = template()
					el.onclick = () => toggleAndUpdate(line)
				}
				if (parent != el.parentNode && !parent.querySelector(".pce-fold")) parent.prepend(el)
				el.classList.toggle("closed-fold", isClosed)
				el.title = `${isClosed ? "Unf" : "F"}old line`
				el = foldPlaceholders[line]
				if (isClosed) {
					if (!el) {
						el = foldPlaceholders[line] = template2()
					}
					const pos2 = getPosition(foldPositions[line]![1])
					const [before, placeholder, after] = <[Text, HTMLElement, Text]>(<any>el.childNodes)
					before.data = getLineBefore(value, pos)
					after.data = /.*/.exec(value.slice(pos2))![0]
					placeholder.onclick = () => toggleAndUpdate(line)
					if (parent != el.parentNode) parent.prepend(el)
				} else el?.remove()
			}
		}
	}

	const toggleAndUpdate = (line: number) => {
		toggleFold(line)
		update(line)
	}

	const createFolds = () => {
		foldToggles = []
		foldPlaceholders = []
		foldPositions = []
		foldedRanges.clear()
		foldedLines.clear()
		value = code = cEditor.value
		lineNumberWidth = Math.ceil(Math.log10(numLines(code))) + ".001ch"
		const folds: [number, number][] = []
		const { matchTags, matchBrackets } = cEditor.extensions

		if (matchTags) {
			let { tags, pairs } = matchTags
			for (let i = 0, j: number, l = pairs.length; i < l; i++) {
				if ((j = pairs[i]!) > i && isMultiline(value, tags[i][2], tags[j][1])) {
					folds.push([tags[i][2], tags[j][1]])
				}
			}
		}
		if (matchBrackets) {
			let { brackets, pairs } = matchBrackets
			for (let i = 0, j: number, l = pairs.length; i < l; i++) {
				if (
					(j = pairs[i]!) > i &&
					brackets[i][3] != "(" &&
					isMultiline(value, brackets[i][1], brackets[j][1])
				)
					folds.push([brackets[i][1] + brackets[i][3].length, brackets[j][1]])
			}
		}
		providers.forEach(clb => folds.push(...clb(cEditor, folds)))

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
				textarea = editor.textarea
				editor.extensions.codeFold = this
				lines = editor.wrapper.children
				if (editor.tokens[0]) createFolds()
			}
			editor.scrollContainer.style.setProperty(
				"--padding-left",
				options.lineNumbers == false ? "calc(var(--_pse) + var(--_ns))" : "",
			)
			editor.addListener("update", createFolds)
			setTimeout(editor.removeListener, 0, "update", createFolds)
		},
		get fullCode() {
			return code
		},
		toggleFold: (lineNumber, force) =>
			!!foldPositions[lineNumber] &&
			foldedLines.has(lineNumber) != force &&
			!toggleFold(lineNumber)!,
		updateFolds: () => update(),
	}
}

/**
 * Folding range provider that allows folding of block comments. For this to work,
 * you need to befine block comments in the {@link languageMap} for the language.
 *
 * Simply pass this function as one of the arguments when calling {@link readOnlyCodeFolding}.
 */
const blockCommentFolding: FoldingRangeProvider = ({ tokens, value, options: { language } }) => {
	const folds: [number, number][] = []
	const findBlockComments = (tokens: TokenStream, position: number, language: string) => {
		for (let i = 0, l = tokens.length; i < l; ) {
			const token = <Token>tokens[i++]
			const content = token.content
			const length = token.length
			const type = token.type
			const aliasType = token.alias || type
			if (aliasType == "comment" && isMultiline(value, position, position + length)) {
				let comment = languageMap[language]?.comments?.block
				if (comment && value.indexOf(comment[0], position) == position)
					folds.push([position + comment[0].length, position + length - comment[1].length])
			} else if (Array.isArray(content)) {
				findBlockComments(
					content,
					position,
					aliasType.indexOf("language-") ? language : aliasType.slice(9),
				)
			}
			position += length
		}
	}

	findBlockComments(tokens, 0, language)

	return folds
}

/**
 * Folding range provider that allows folding of titles and code blocks in markdown.
 *
 * Simply pass this function as one of the arguments when calling {@link readOnlyCodeFolding}.
 */
const markdownFolding: FoldingRangeProvider = ({ tokens, value, options: { language } }) => {
	let folds: [number, number][] = []
	let pos = 0
	let openTitles: number[] = []
	let closeTitles = (level: number) => {
		let end = value.slice(0, pos).trimEnd().length
		for (let i = level - 1; i < openTitles.length; i++) {
			folds.push([openTitles[i], end])
		}
	}
	if (language == "markdown" || language == "md")
		for (let i = 0, end = tokens.length - 1; ; i++) {
			const token = <Token>tokens[i]
			const length = token.length
			const type = token.type
			if (type == "code" && !token.alias) {
				let content = <Token[]>(<Token>token).content
				folds.push([
					pos + content[0].length + (content[1].content || "").length,
					pos + length - content[content.length - 1].length - 1,
				])
			}
			if (type == "title") {
				let [token1, token2] = <Token[]>(<Token>token).content
				let level = token1.type ? token1.length : (<string>token2.content)[0] == "=" ? 1 : 2
				closeTitles(level)
				openTitles.length = level
				openTitles[level - 1] = pos + (token1.type ? length : token1.length - 1)
			}

			pos += length
			if (i == end) {
				closeTitles(1)
				break
			}
		}

	return folds
}

export { readOnlyCodeFolding, markdownFolding, blockCommentFolding }
