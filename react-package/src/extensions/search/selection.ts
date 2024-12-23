import { useLayoutEffect } from "react"
import { PrismEditor } from "../../types"
import { SearchFilter, useEditorSearch } from "./search"

/**
 * Hook that highlights selection matches in an editor.
 * @param caseSensitive Whether or not matches must have the same case. Defaults to false.
 * @param minLength Minimum length needed to perform a search. Defaults to 1.
 * @param maxLength Maximum length at which to perform a search. Defaults to 200.

 * Lower values of `minLength` and higher values of `maxLength` can impact performance.
 * 
 * The CSS-selector `.selection-matches span` can be used to style the matches.
 */
export const useHighlightSelectionMatches = (
	editor: PrismEditor,
	caseSensitive?: boolean,
	minLength = 1,
	maxLength = 200,
) => {
	const searchAPI = useEditorSearch(editor, "selection-matches", -1)

	useLayoutEffect(() => {
		return editor.on("selectionChange", ([start, end], value) => {
			value = editor.focused ? value.slice(start, end) : ""
			const pos = start + value.search(/\S/)
			const l = (value = value.trim()).length

			searchAPI.search(
				minLength > l || l > maxLength ? "" : value,
				caseSensitive,
				false,
				false,
				undefined,
				(mStart, mEnd) => mStart > pos || mEnd <= pos,
			)
		})
	}, [caseSensitive, minLength, maxLength])
}

/**
 * Hook that highlights all instances of the word the cursor is on if there's no selection.
 * @param filter Function that can filter away matches based on their position.
 * @param includeHyphens A function returning whether or not hyphens should be included in the search.
 * For languages that don't commonly use hyphens as an operator (such as CSS), it makes sense to
 * return true. If this parameter is omitted, hyphens are not included.
 *
 * The CSS-selector `.word-matches span` can be used to style the matches.
 *
 * @example
 * This filters away all words that start inside a string, comment or keyword or regex token.
 * Different filter functions should be chosen based on the language.
 * ```
 * const selector = ".string, .comment, .keyword, .regex"
 * const filter = start => !getClosestToken(editor, selector, 0, 0, start)
 * const includeHyphens = position => getLanguage(editor, position) == "css"
 *
 * useHighlightCurrentWord(editor, filter, includeHyphens)
 * ```
 */
export const useHighlightCurrentWord = (
	editor: PrismEditor,
	filter?: SearchFilter,
	includeHyphens?: (cursorPosition: number) => boolean,
) => {
	const searchAPI = useEditorSearch(editor, "word-matches", -1)

	useLayoutEffect(() => {
		let noHighlight = false
		let cleanup1 = editor.on("update", () => (noHighlight = true))
		let cleanup2 = editor.on("selectionChange", ([start, end], value) => {
			if (start < end || !editor.focused || noHighlight) searchAPI.search("")
			else {
				let group = `[_$\\p{L}\\d${includeHyphens && includeHyphens(start) ? "-" : ""}]`
				let before = value.slice(0, start).match(RegExp(group + "*$", "u"))!
				let index = before.index!
				let word = before[0] + value.slice(start).match(RegExp("^" + group + "*", "u"))![0]
				searchAPI.search(
					/^-*(\d|$)/.test(word) || (filter && !filter(index, index + word.length)) ? "" : word,
					true,
					true,
					false,
					undefined,
					filter,
					RegExp(group + "{2}", "u"),
				)
			}
			noHighlight = false
		})

		return () => {
			cleanup1()
			cleanup2()
		}
	}, [filter, includeHyphens])
}
