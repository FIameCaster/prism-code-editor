import { EditorEventMap, Extension, PrismEditor } from "../.."
import { SearchAPI, SearchFilter, createSearchAPI } from "./search"

export interface WordHighlighter extends Extension {
	/** Sets the search filter used. Useful for updating the filter after changing an editors language. */
	setFilter(newFilter: SearchFilter): void
}

const extensionTemplate = (
	className: string,
	handler: (editor: PrismEditor, api: SearchAPI) => EditorEventMap["selectionChange"],
): Extension => ({
	update(editor: PrismEditor) {
		this.update = () => {}
		const searchAPI = createSearchAPI(editor),
			container = searchAPI.container

		container.style.zIndex = <any>-1
		container.className = className

		editor.addListener("selectionChange", handler(editor, searchAPI))
	},
})

/**
 * Extension that highlights selection matches in an editor.
 * @param caseSensitive Whether or not matches must have the same case. Defaults to false.
 * @param minLength Minimum length needed to perform a search. Defaults to 1.
 * @param maxLength Maximum length at which to perform a search. Defaults to 200.

 * Lower values of `minLength` and higher values of `maxLength` can impact performance.
 * 
 * The CSS-selector `.selection-matches span` can be used to style the matches.
 */
const highlightSelectionMatches = (caseSensitive?: boolean, minLength = 1, maxLength = 200) =>
	extensionTemplate("selection-matches", (editor, searchAPI) => ([start, end], value) => {
		value = editor.focused ? value.slice(start, end) : ""
		let offset = value.search(/\S/),
			l = (value = value.trim()).length

		searchAPI.search(
			minLength > l || l > maxLength ? "" : value,
			caseSensitive,
			false,
			false,
			undefined,
			start + offset,
		)
	})

/**
 * Extension that highlights all instances of the word the cursor is on if there's no selection.
 * @param filter Function that can filter away matches based on their position.
 * The filter can be changed later using the `setFilter` method.
 *
 * The CSS-selector `.word-matches span` can be used to style the matches.
 *
 * @example
 * This filters away all words that start inside a string, comment or keyword or regex token.
 * Different filter functions should be chosen based on language.
 * ```
 * editor.addExtensions(
 * 	highlightCurrentword(
 * 		start => !getClosestToken(editor, ".string, .comment, .keyword, .regex", 0, 0, start)
 * 	)
 * )
 * ```
 */
const highlightCurrentWord = (filter?: SearchFilter): WordHighlighter =>
	Object.assign(
		extensionTemplate("word-matches", (editor, searchAPI) => {
			let noHighlight = true
			editor.addListener("update", () => (noHighlight = true))

			return ([start, end], value) => {
				let before = value.slice(0, start).match(/[\p{L}_$\d-]*$/u)!
				let index = before.index!
				let word = before[0] + value.slice(start).match(/^[\p{L}_$\d-]*/u)![0]
				searchAPI.search(
					noHighlight ||
						start != end ||
						!editor.focused ||
						/^-*\d/.test(word) ||
						(filter && !filter(index, index + word.length))
						? ""
						: word,
					true,
					true,
					false,
					undefined,
					filter,
				)
				noHighlight = false
			}
		}),
		{
			setFilter(newFilter: SearchFilter) {
				filter = newFilter
			},
		},
	)

export { highlightSelectionMatches, highlightCurrentWord }
