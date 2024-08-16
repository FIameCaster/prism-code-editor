import { BasicExtension } from "../../index.js"
import { createSearchAPI } from "./search.js"

/**
 * Extension that shows tabs and spaces.
 * @param alwaysShow By default, spaces and tabs are only shown when they're selected.
 * By passing `true`, they're always shown, which negatively impacts performance when
 * typing, and increases the amount of elements in the DOM.
 *
 * Requires styling from `prism-code-editor/invisibles.css`.
 */
const showInvisibles = (alwaysShow?: boolean): BasicExtension => {
	return editor => {
		let prev: string
		const searchAPI = createSearchAPI(editor)
		const matches = searchAPI.matches
		const container = searchAPI.container
		const nodes = container.children
		const tabs: boolean[] = []
		const update = () => {
			const value = editor.value
			const [start, end] = editor.getSelection()

			if (!alwaysShow || prev != (prev = value)) {
				searchAPI.search(" |\t", true, false, true, alwaysShow ? undefined : [start, end])
				for (let i = 0, l = matches.length; i < l; i++) {
					if ((value[matches[i][0]] == "\t") == !tabs[i]) {
						nodes[i].className = (tabs[i] = !tabs[i]) ? "pce-tab" : ""
					}
				}
			}
		}

		container.className = "pce-invisibles"
		if (editor.value) update()
		editor.addListener("selectionChange", update)
	}
}

export { showInvisibles }
