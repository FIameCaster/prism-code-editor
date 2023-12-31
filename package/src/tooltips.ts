import { PrismEditor } from "."
import { createTemplate } from "./core"
import { cursorPosition } from "./extensions/cursor"

const template = /* @__PURE__ */ createTemplate(
	"<div></div>",
	"z-index:5;top:auto;display:flex;",
	"tooltip-wrapper",
)

/**
 * Moves to tooltip to align with the cursor and shows it.
 * @param preferPlacingAboveCursor Whether the preferred position is above the cursor or not.
 */
export type ShowTooltip = (preferPlacingAboveCursor?: boolean) => void

/** Function removing the tooltip from the DOM. */
export type HideTooltip = () => void

/**
 * Utility making it easy to add tooltips to an editor. Before you can show the tooltip,
 * a {@link cursorPosition} extension must be added to the editor.
 * @param editor Editor you want to add the tooltip to.
 * @param element Element for the tooltip.
 * @param fixedWidth If false, the tooltip will shrink instead of getting offset to
 * the left if there's not enough space to the right of the cursor. Defaults to `true`.
 * @returns Show and hide functions.
 *
 * @example
 * const [show, hide] = addTooltip(editor, element)
 */
export const addTooltip = (
	editor: PrismEditor,
	element: HTMLElement,
	fixedWidth = true,
): [ShowTooltip, HideTooltip] => {
	const container = <HTMLDivElement>template.cloneNode(true)
	const style = container.style
	const spacer = <HTMLDivElement>container.firstChild

	container.append(element)
	;(fixedWidth ? element : spacer).style.flexShrink = <any>0

	return [
		(above?: boolean) => {
			let cursor = editor.extensions.cursor
			if (cursor) {
				let { left, right, top, bottom, height } = cursor.getPosition()
				container.parentNode || editor.overlays.append(container)
				spacer.style.width = (editor.options.rtl ? right : left) + "px"

				let placeAbove =
					!above == top > bottom && (above ? top : bottom) < container.clientHeight ? !above : above

				style[placeAbove ? "bottom" : "top"] = height + (placeAbove ? bottom : top) + "px"
				style[placeAbove ? "top" : "bottom"] = "auto"
			}
		},
		() => container.remove(),
	]
}

const observer =
	window.ResizeObserver &&
	/* @__PURE__ */ new ResizeObserver(e =>
		e.forEach(entry => {
			const el = entry.target
			const wrapper = el.querySelector<HTMLDivElement>(".pce-wrapper")!
			const style = getComputedStyle(wrapper)
			wrapper.style.paddingBottom = `${
				el.clientHeight - parseFloat(style.marginBottom) - parseFloat(style.lineHeight)
			}px`
		}),
	)

/** Allows users to scroll past the last line in the editor by adding padding to the wrapper. */
export const addOverscroll = (editor: PrismEditor) => {
	observer && observer.observe(editor.scrollContainer)
}

/** Removes the ability to scroll past the last line in the editor. */
export const removeOverscroll = (editor: PrismEditor) => {
	const el = editor.scrollContainer
	observer && observer.unobserve(el)
	el.querySelector<HTMLDivElement>(".pce-wrapper")!.style.paddingBottom = ""
}
