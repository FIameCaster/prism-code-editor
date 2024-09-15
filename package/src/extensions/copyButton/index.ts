/** @module copy-button */

import { addListener, createTemplate, doc } from "../../core.js"
import { BasicExtension } from "../../types.js"
import { addOverlay, setSelection } from "../../utils/index.js"

/**
 * Creates a static copy button that can be added to the overlays of an editor or code
 * block. The `firstChild` of the element returned is the button itself.
 */
const createCopyButton = createTemplate(
	'<div style=display:flex;align-items:flex-start;justify-content:flex-end><button type=button dir=ltr style=display:none class=pce-copy aria-label=Copy><svg width=1.2em viewBox="0 0 16 16" overflow=visible stroke-linecap=round fill=none stroke=currentColor><rect x=4 y=4 width=11 height=11 rx=1 /><path d="M12 2a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1">',
)

/**
 * Extension that adds a copy button to the editor.
 * Probably best used with a read-only editor.
 * You must also import styles from `prism-code-editor/copy-button.css`.
 */
const copyButton = (): BasicExtension => editor => {
	const container = createCopyButton()
	const btn = <HTMLButtonElement>container.firstChild!

	addListener(btn, "click", () => {
		btn.setAttribute("aria-label", "Copied!")
		if (!navigator.clipboard?.writeText(editor.extensions.codeFold?.fullCode ?? editor.value)) {
			editor.textarea.select()
			doc!.execCommand("copy")
			setSelection(editor, 0)
		}
	})

	addListener(btn, "pointerenter", () => btn.setAttribute("aria-label", "Copy"))

	addOverlay(editor, container)
}

export { copyButton, createCopyButton }
