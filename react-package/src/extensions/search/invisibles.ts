import { useLayoutEffect } from "react"
import { useStableRef } from "../../core"
import { PrismEditor } from "../../types"
import { useEditorSearch } from "./search"

/**
 * Hook that shows tabs and spaces in an editor.
 * @param alwaysShow By default, spaces and tabs are only shown when they're selected.
 * By passing `true`, they're always shown, which negatively impacts performance when
 * typing, and increases the amount of elements in the DOM.
 *
 * Requires styling from `prism-react-editor/invisibles.css`.
 */
const useShowInvisibles = (editor: PrismEditor, alwaysShow?: boolean) => {
	const show = useStableRef([alwaysShow])
	const searchAPI = useEditorSearch(editor, "pce-invisibles")
	show[0] = alwaysShow

	useLayoutEffect(() => {
		let prev: string
		const matches = searchAPI.matches
		const container = searchAPI.container
		const nodes = container.children
		const tabs: boolean[] = []
		const update = () => {
			const value = editor.value
			const [start, end] = editor.getSelection()

			if (!show[0] || prev != (prev = value)) {
				searchAPI.search(" |\t", true, false, true, show[0] ? undefined : [start, end])
				for (let i = 0, l = matches.length; i < l; i++) {
					if ((value[matches[i][0]] == "\t") == !tabs[i]) {
						nodes[i].className = (tabs[i] = !tabs[i]) ? "pce-tab" : ""
					}
				}
			}
		}

		if (editor.value) update()
		return editor.on("selectionChange", update)
	}, [])
}

export { useShowInvisibles }
