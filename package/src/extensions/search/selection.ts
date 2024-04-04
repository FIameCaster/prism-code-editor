import { BasicExtension } from "../../index.js"
import { SearchAPI, SearchFilter, createSearchAPI } from "./search.js"

export interface SelectionMatchHighlighter extends BasicExtension {
	/**
	 * Search API used by the extension.
	 * Can be used get the position of the matches for example.
	 * This property is only present after the extension is added to an editor.
	 */
	api?: SearchAPI
}

export interface WordHighlighter extends SelectionMatchHighlighter {
	/** Sets the search filter used. Useful for updating the filter after changing an editor's language. */
	setFilter(newFilter: SearchFilter): void
}

/**
 * Extension that highlights selection matches in an editor.
 * @param caseSensitive Whether or not matches must have the same case. Defaults to false.
 * @param minLength Minimum length needed to perform a search. Defaults to 1.
 * @param maxLength Maximum length at which to perform a search. Defaults to 200.

 * Lower values of `minLength` and higher values of `maxLength` can impact performance.
 * 
 * The CSS-selector `.selection-matches span` can be used to style the matches.
 */
const highlightSelectionMatches = (caseSensitive?: boolean, minLength = 1, maxLength = 200) => {
	const self: SelectionMatchHighlighter = editor => {
		const searchAPI = (self.api = createSearchAPI(editor))
		const container = searchAPI.container

		container.style.zIndex = <any>-1
		container.className = "selection-matches"

		editor.addListener("selectionChange", ([start, end], value) => {
			value = editor.focused ? value.slice(start, end) : ""
			start += value.search(/\S/)
			value = value.trim()
			let l = value.length

			searchAPI.search(
				minLength > l || l > maxLength ? "" : value,
				caseSensitive,
				false,
				false,
				undefined,
				(mStart, mEnd) => mStart > start || mEnd <= start
			)
		})
	}
	return self
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
 * editor.addExtensions(
 * 	highlightCurrentWord(filter, includeHyphens)
 * )
 * ```
 */
const highlightCurrentWord = (
	filter?: SearchFilter,
	includeHyphens?: (cursorPosition: number) => boolean,
) => {
	const self: WordHighlighter = editor => {
		let noHighlight = false
		let searchAPI = (self.api = createSearchAPI(editor))
		let container = searchAPI.container

		container.style.zIndex = <any>-1
		container.className = "word-matches"

		editor.addListener("update", () => (noHighlight = true))
		editor.addListener("selectionChange", ([start, end], value) => {
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
	}
	self.setFilter = newFilter => (filter = newFilter)
	return self
}

export { highlightSelectionMatches, highlightCurrentWord }
