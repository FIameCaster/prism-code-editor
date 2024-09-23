import { addListener, createTemplate } from "../core.js"
import { addOverlay } from "../utils/index.js"
import { getPosition } from "../utils/local.js"
import { PrismCodeBlock } from "./code-block.js"

export type HoverOptions = {
	/** Whether the prefered position of the tooltip is above the token. @default false */
	above?: boolean
	/** A CSS length value for the tooltip's max width. */
	maxWidth?: string
	/** A CSS length value for the tooltip's max height. */
	maxHeight?: string
}

let counter = 0

const template = createTemplate(
	"<div class=pce-tooltip style=z-index:5;top:auto;display:flex><div></div><div class=pce-hover-tooltip style=flex-shrink:0>",
)

/**
 * Utility that makes it easier to add hover descriptions to tokens.
 * @param codeBlock Code block to add the functionality to.
 * @param callback Function called when a token with only textual children is hovered.
 *
 * The function gets called with the following arguments:
 * - `types`: Array with the token's type as the first element, followed by any alises.
 * - `language`: The language at the token's position.
 * - `text`: The `textContent` of the token.
 * - `element`: The `<span>` element for the hovered token.
 *
 * Lastly, the function should return an array of children that get added to the tooltip.
 * If `null` or `undefined` is returned, no tooltip is shown for the token.
 * @param options Options for configuring the size and position of the tooltip.
 */
const addHoverDescriptions = (
	codeBlock: PrismCodeBlock,
	callback: (
		types: string[],
		language: string,
		text: string,
		element: HTMLSpanElement,
	) => (string | Node)[] | null | undefined,
	options: HoverOptions = {},
) => {
	let current: HTMLSpanElement
	const { above, maxHeight, maxWidth } = options
	const container = template()
	const pre = codeBlock.container
	const style = container.style
	const [spacer, tooltip] = container.children as HTMLCollectionOf<HTMLDivElement>
	const wrapper = codeBlock.wrapper
	const id = (tooltip.id = "pce-hover-" + counter++)

	const show = (target: HTMLElement) => {
		const types = target.className.slice(6).split(" ")
		const text = target.textContent!
		const language = target.closest("[class*=language-]")!.className.match(/language-(\S*)/)![1]
		const content = callback(types, language, text, target)
		if (content) {
			let { left, right, top, bottom, height } = getPosition(codeBlock, target)
			let { clientHeight, clientWidth } = pre
			let max = bottom > top ? bottom : top

			tooltip.style.maxWidth = `min(${
				maxWidth ? maxWidth + "," : ""
			}${clientWidth}px - var(--padding-left) - 1em)`
			tooltip.style.maxHeight = `min(${maxHeight ? maxHeight + "," : ""}${max}px, ${
				clientHeight * 0.6
			}px - 2em)`
			spacer.style.width = (pre.matches(".pce-rtl") ? right : left) + "px"
			tooltip.textContent = ""
			tooltip.append(...content)
			container.parentNode || addOverlay(codeBlock, container)

			let placeAbove =
				!above == top > bottom && (above ? top : bottom) < container.clientHeight ? !above : above

			style[placeAbove ? "bottom" : "top"] = height + (placeAbove ? bottom : top) + "px"
			style[placeAbove ? "top" : "bottom"] = "auto"
			target.setAttribute("aria-describedby", id)
			current = target
		}
	}

	const hide = () => {
		current?.removeAttribute("aria-describedby")
		container.remove()
	}

	addListener(tooltip, "pointerleave", hide)

	addListener(wrapper, "pointerover", e => {
		const target = e.target as HTMLSpanElement
		if (!tooltip.contains(target)) {
			if (
				target.matches(".token") &&
				(e.pointerType != "mouse" || !e.buttons) &&
				!target.childElementCount
			) {
				show(target)
			} else hide()
		}
	})
}

export { addHoverDescriptions }
