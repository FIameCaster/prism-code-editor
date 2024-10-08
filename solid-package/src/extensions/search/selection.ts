import { createEffect, untrack } from "solid-js"
import { Extension } from "../../types"
import { SearchFilter, createSearchAPI } from "./search"

/**
 * Extension that highlights selection matches in an editor.
 * @param caseSensitive Whether or not matches must have the same case. Defaults to false.
 * @param minLength Minimum length needed to perform a search. Defaults to 1.
 * @param maxLength Maximum length at which to perform a search. Defaults to 200.

 * Lower values of `minLength` and higher values of `maxLength` can impact performance.
 * 
 * The CSS-selector `.selection-matches span` can be used to style the matches.
 */
const highlightSelectionMatches = (
	caseSensitive?: boolean,
	minLength = 1,
	maxLength = 200,
): Extension => {
	return editor => {
		const searchAPI = createSearchAPI(editor)
		const container = searchAPI.container

		container.style.zIndex = <any>-1
		container.className = "selection-matches"

		createEffect(() => {
			let [start, end] = editor.selection()
			let value = untrack(editor.focused) ? editor.value.slice(start, end) : ""
			let pos = start + value.search(/\S/)
			let l = (value = value.trim()).length

			searchAPI.search(
				minLength > l || l > maxLength ? "" : value,
				caseSensitive,
				false,
				false,
				undefined,
				(mStart, mEnd) => mStart > pos || mEnd <= pos,
			)
		})

		return container
	}
}

/**
 * Extension that highlights all instances of the word the cursor is on if there's no selection.
 * @param filter Function that can filter away matches based on their position.
 * The filter can be changed later using the `setFilter` method.
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
 * const extensions = [highlightCurrentWord(filter, includeHyphens)]
 * ```
 */
const highlightCurrentWord = (
	filter?: SearchFilter,
	includeHyphens?: (cursorPosition: number) => boolean,
): Extension => {
	return editor => {
		let noHighlight = false
		let searchAPI = createSearchAPI(editor)
		let container = searchAPI.container

		container.style.zIndex = <any>-1
		container.className = "word-matches"

		createEffect(() => {
			editor.tokens()
			noHighlight = true
		})

		createEffect(() => {
			const [start, end] = editor.selection()
			const value = editor.value
			if (start < end || !untrack(editor.focused) || noHighlight) searchAPI.search("")
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

		return container
	}
}

export { highlightSelectionMatches, highlightCurrentWord }
