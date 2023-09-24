import { Extension, PrismEditor } from "../.."
import { createSearchAPI } from "./search"

/**
 * Extension that highlights selection matches in an editor.
 * @param caseSensitive Whether or not matches must have the same case. Defaults to false.
 * @param minLength Minimum length needed to perform a search. Defaults to 1.
 * @param maxLength Maximum length at which to perform a search. Defaults to 200.
 *
 * Lower values of `minLength` and higher values of `maxLength` can impact performance.
 */
export const highlightSelectionMatches = (
	caseSensitive?: boolean,
	minLength = 1,
	maxLength = 200,
): Extension => {
	let initialized: boolean

	return {
		update(editor: PrismEditor) {
			if (!initialized) {
				const searchAPI = createSearchAPI(editor),
					container = searchAPI.container

				initialized = true
				container.style.zIndex = <any>-1
				container.className = "selection-matches"
				editor.addListener("selectionChange", ([start, end], value) => {
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
			}
		},
	}
}
