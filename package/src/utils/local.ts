import { isChrome, PrismEditor } from "../index.js"
import { addListener } from "../core.js"

const scrollToEl = (editor: PrismEditor, el: HTMLElement, paddingTop = 0) => {
	const style1 = editor.scrollContainer.style,
		style2 = document.documentElement.style

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
	editor: PrismEditor,
	type: T,
	listener: (this: HTMLElement, ev: HTMLElementEventMap[T]) => any,
	options?: boolean | AddEventListenerOptions,
) => addListener(editor.textarea, type, listener, options)

const getStyleValue = (el: HTMLElement, prop: keyof CSSStyleDeclaration) =>
	parseFloat(<string>getComputedStyle(el)[prop])

export { scrollToEl, getLineStart, getLineEnd, getStyleValue, addTextareaListener }
