import { template as _template } from "solid-js/web"
import { Extension } from "../../types"
import { doc } from "../../core"
import { setSelection } from "../../utils"

const createCopyButton = _template(
	'<div style=display:flex;align-items:flex-start;justify-content:flex-end><button type=button dir=ltr style=display:none class=pce-copy aria-label=Copy><svg width=1.2em aria-hidden=true viewBox="0 0 16 16" overflow=visible stroke-linecap=round fill=none stroke=currentColor><rect x=4 y=4 width=11 height=11 rx=1 /><path d="M12 2a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1">',
)

/**
 * Extension that adds a copy button to the editor. Probably best used with a read-only
 * editor. Requires styles from `solid-prism-editor/copy-button.css` to work.
 */
const copyButton = (): Extension => editor => {
	const container = createCopyButton()
	const btn = container.firstChild as HTMLButtonElement

	btn.addEventListener("click", () => {
		btn.setAttribute("aria-label", "Copied!")
		if (!navigator.clipboard?.writeText(editor.extensions.folding?.fullCode ?? editor.value)) {
			editor.textarea.select()
			doc!.execCommand("copy")
			setSelection(editor, 0)
		}
	})

	btn.addEventListener("pointerenter", () => btn.setAttribute("aria-label", "Copy"))

	return container
}

export { createCopyButton, copyButton }
