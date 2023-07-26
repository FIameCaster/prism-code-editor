import { Extension, PrismEditor } from "../.."
import { createSearchAPI } from "./search"

/**
 * Highlights selection matches in an editor
 * @param caseSensitive Whether or not matches must have the same case as the selection.
 * Defaults to false
 */
export const highlightSelectionMatches = (caseSensitive?: boolean): Extension => {
	let initialized: boolean

	return {
		update(editor: PrismEditor) {
			if (initialized != (initialized = true)) {
				const searchAPI = createSearchAPI(editor),
					container = searchAPI.container

				container.style.zIndex = "-1"
				container.className = "selection-matches"
				editor.addListener("selectionChange", ([start, end], value) =>
					searchAPI.search(
						end - start > 200 ? "" : (value = value.slice(start, end)).trim(),
						caseSensitive,
						false,
						false,
						undefined,
						start + value.search(/\S/),
					),
				)
			}
		},
	}
}
