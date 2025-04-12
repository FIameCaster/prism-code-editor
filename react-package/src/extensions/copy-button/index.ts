import { useEffect } from "react"
import { PrismEditor } from "../../types"
import { createTemplate } from "../../utils/local"
import { addOverlay, setSelection } from "../../utils"
import { addListener, doc } from "../../core"

/**
 * Creates a static copy button that can be added to the overlays of an editor or code
 * block. The `firstChild` of the element returned is the button itself.
 */
const createCopyButton = createTemplate(
	'<div style=display:flex;align-items:flex-start;justify-content:flex-end><button type=button dir=ltr style=display:none class=pce-copy aria-label=Copy><svg width=1.2em aria-hidden=true viewBox="0 0 16 16" overflow=visible stroke-linecap=round fill=none stroke=currentColor><rect x=4 y=4 width=11 height=11 rx=1 /><path d="m12 2a1 1 0 00-1-1H2A1 1 0 001 2v9a1 1 0 001 1">',
)

/**
 * Hook that adds a copy button to the editor. Probably best used with a read-only editor.
 * Requires styles from `prism-react-editor/copy-button.css` to work.
 */
const useCopyButton = (editor: PrismEditor) => {
	useEffect(() => {
		const container = createCopyButton()
		const btn = container.firstChild as HTMLButtonElement

		addListener(btn, "click", () => {
			btn.setAttribute("aria-label", "Copied!")
			if (!navigator.clipboard?.writeText(editor.extensions.folding?.fullCode ?? editor.value)) {
				editor.textarea!.select()
				doc!.execCommand("copy")
				setSelection(editor, 0)
			}
		})

		addListener(btn, "pointerenter", () => btn.setAttribute("aria-label", "Copy"))

		addOverlay(editor, container)
		return () => container.remove()
	}, [])
}

export { useCopyButton, createCopyButton }
