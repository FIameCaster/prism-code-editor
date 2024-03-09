import { isChrome, PrismEditor } from "../index.js"

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

export { scrollToEl, getLineStart, getLineEnd }
