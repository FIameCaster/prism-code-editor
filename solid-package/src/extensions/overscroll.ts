import { onCleanup, onMount } from "solid-js"
import { Extension } from ".."
import { getStyleValue } from "../utils/other"

/** Extension that allows the user to scroll past the last line. */
export const overscroll = (): Extension => editor => {
	if (window.ResizeObserver) {
		const wrapper = editor.wrapper
		const container = editor.container
		const observer = new ResizeObserver(() => {
			wrapper.style.paddingBottom = `${
				container.clientHeight -
				getStyleValue(wrapper, "marginBottom") -
				getStyleValue(wrapper, "lineHeight")
			}px`
		})
		observer.observe(container)
		onCleanup(() => {
			observer.disconnect()
		})
	}
}
