import { CodeBlockOverlay } from "."
import { addListener, doc } from "../core"
import { createCopyButton } from "../extensions/copy-button"

/**
 * Adds a copy button to a code block. Requires styles from
 * `solid-prism-editor/copy-button.css`.
 */
const addCopyButton: CodeBlockOverlay = (codeblock, props) => {
	const container = createCopyButton()
	const btn = container.firstChild as HTMLButtonElement

	addListener(btn, "click", () => {
		btn.setAttribute("aria-label", "Copied!")
		if (!navigator.clipboard?.writeText(props.code)) {
			const selection = getSelection()!
			const range = new Range()
			selection.removeAllRanges()
			selection.addRange(range)
			range.setStartAfter(codeblock.lines[0])
			range.setEndAfter(codeblock.wrapper)
			doc!.execCommand("copy")
			range.collapse()
		}
	})

	addListener(btn, "pointerenter", () => btn.setAttribute("aria-label", "Copy"))

	return container
}

export { addCopyButton }
