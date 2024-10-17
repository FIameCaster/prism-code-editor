import { PrismEditor } from "../types"
import { addListener } from "../core"
import { isChrome } from "."
import { PrismCodeBlock } from "../code-block"

const scrollToEl = (editor: PrismEditor, el: HTMLElement, paddingTop = 0) => {
	const style1 = editor.container.style
	const style2 = document.documentElement.style

	style1.scrollPaddingBlock = style2.scrollPaddingBlock = `${paddingTop}px ${
		isChrome && !el.textContent ? el.offsetHeight : 0
	}px`

	el.scrollIntoView({ block: "nearest" })
	style1.scrollPaddingBlock = style2.scrollPaddingBlock = ""
}

const getLineStart = (text: string, position: number) =>
	position ? text.lastIndexOf("\n", position - 1) + 1 : 0

const getLineEnd = (text: string, position: number) =>
	(position = text.indexOf("\n", position)) + 1 ? position : text.length

const addTextareaListener = <T extends keyof HTMLElementEventMap>(
	{ textarea }: PrismEditor,
	type: T,
	listener: (this: HTMLElement, ev: HTMLElementEventMap[T]) => any,
	options?: boolean | AddEventListenerOptions,
) => {
	addListener(textarea, type, listener, options)
	return () => textarea.removeEventListener(type, listener, options)
}

const updateNode = (node: Text, text: string) => {
	if (node.data != text) node.data = text
}

const getPosition = (editor: PrismEditor | PrismCodeBlock, el: HTMLElement) => {
	const rect1 = el.getBoundingClientRect()
	const rect2 = editor.lines[0].getBoundingClientRect()

	return {
		top: rect1.y - rect2.y,
		bottom: rect2.bottom - rect1.bottom,
		left: rect1.x - rect2.x,
		right: rect2.right - rect1.right,
		height: rect1.height,
	}
}

export { scrollToEl, getLineStart, getLineEnd, addTextareaListener, getPosition, updateNode }