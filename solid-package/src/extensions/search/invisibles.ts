import { createEffect } from "solid-js"
import { Extension } from "../.."
import { createSearchAPI } from "./search"

/**
 * Extension that shows tabs and spaces.
 * @param alwaysShow By default, spaces and tabs are only shown when they're selected.
 * By passing `true`, they're always shown, which negatively impacts performance when
 * typing, and increases the amount of elements in the DOM.
 *
 * Requires styling from `solid-prism-editor/invisibles.css`.
 */
const showInvisibles = (alwaysShow?: boolean): Extension => {
	return editor => {
		let prev: string
		const searchAPI = createSearchAPI(editor)
		const matches = searchAPI.matches
		const container = searchAPI.container
		const nodes = container.children
		const tabs: boolean[] = []
		
		container.className = "pce-invisibles"
		createEffect(() => {	
			const value = editor.value
			const [start, end] = editor.selection()
	
			if (!alwaysShow || prev != (prev = value)) {
				searchAPI.search(" |\t", true, false, true, alwaysShow ? undefined : [start, end])
				for (let i = 0, l = matches.length; i < l; i++) {
					if ((value[matches[i][0]] == "\t") == !tabs[i]) {
						nodes[i].className = (tabs[i] = !tabs[i]) ? "pce-tab" : ""
					}
				}
			}
		})

		return container
	}
}

export { showInvisibles }
