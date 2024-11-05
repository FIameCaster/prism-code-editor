/** @module code-blocks */

import { addListener } from "../core.js"
import { createCopyButton } from "../extensions/copyButton/index.js"
import { addOverlay } from "../utils/index.js"

export type PrismCodeBlock = {
	/** Outermost element of the code block. */
	readonly container: HTMLPreElement
	/** `<code>` element wrapping the lines and overlays. */
	readonly wrapper: HTMLElement
	/**
	 * Collection containing the overlays as the first element. The rest of the elements
	 * are the code lines. This means the first line starts at index 1.
	 */
	readonly lines: HTMLCollectionOf<HTMLDivElement>
	/** The code of the code block. */
	readonly code: string
	/** The language of the code block. */
	readonly language: string
}

/**
 * Runs a callback function for each code block under the root in document order. If a
 * callback has previously been run for a code block, it's skipped.
 *
 * The callback function takes the code block as the first argument. The second parameter
 * is any additional properties passed when the code block was created. These options
 * were stringified to JSON and parsed.
 * @param root Root to search for code blocks under.
 * @param callback Function to run for each code block.
 * @returns An array with all visited code blocks in document order.
 */
const forEachCodeBlock = <T extends {}>(
	root: Document | Element,
	callback: (codeBlock: PrismCodeBlock, options: T) => void,
) => {
	let els = root.getElementsByClassName("prism-code-editor") as HTMLCollectionOf<HTMLPreElement>
	let i = 0
	let result: PrismCodeBlock[] = []

	while (i < els.length) {
		const element = els[i++]
		const json = element.dataset.props

		if (!json) continue

		const wrapper = element.firstChild as HTMLElement
		const lines = wrapper.children as HTMLCollectionOf<HTMLDivElement>
		const code = wrapper.textContent!.slice(0, -1)
		const codeBlock = {
			container: element,
			wrapper,
			lines,
			code,
			language: /language-(\S*)/.exec(element.className)![1],
		}

		element.removeAttribute("data-props")
		callback(codeBlock, JSON.parse(json))
		result.push(codeBlock)
	}

	return result
}

/**
 * Adds a copy button to a code block. Requires styles from
 * `prism-code-editor/copy-button.css`.
 * @param codeblock Code block to add the copy button to.
 */
const addCopyButton = (codeblock: PrismCodeBlock) => {
	const container = createCopyButton()
	const btn = container.firstChild as HTMLButtonElement

	addListener(btn, "click", () => {
		btn.setAttribute("aria-label", "Copied!")
		if (!navigator.clipboard?.writeText(codeblock.code)) {
			const selection = getSelection()!
			const range = new Range()
			selection.removeAllRanges()
			selection.addRange(range)
			range.setStartAfter(codeblock.lines[0])
			range.setEndAfter(codeblock.wrapper)
			document.execCommand("copy")
			range.collapse()
		}
	})

	addListener(btn, "pointerenter", () => btn.setAttribute("aria-label", "Copy"))

	addOverlay(codeblock, container)
}

export { forEachCodeBlock, addCopyButton }
export * from "./hover.js"
