import { useLayoutEffect } from "react"
import { PrismEditor } from "../types"
import { getStyleValue } from "../utils/other"

/** Hook that allows the user to scroll past the last line. */
export const useOverscroll = (editor: PrismEditor) => {
	useLayoutEffect(() => {
		if (window.ResizeObserver) {
			const observer = new ResizeObserver(() => {
				const wrapper = editor.wrapper!
				wrapper.style.paddingBottom = `${
					editor.container!.clientHeight -
					getStyleValue(wrapper, "marginBottom") -
					getStyleValue(wrapper, "lineHeight")
				}px`
			})
			const observe = () => observer.observe(editor.container!)
			let cleanup: () => void

			// The editor might not have mounted yet
			if (editor.lines) {
				observe()
			} else {
				cleanup = editor.on("update", () => {
					observe()
					cleanup()
				})
			}
			return () => {
				if (cleanup) cleanup()
				observer.disconnect()
			}
		}
	}, [])
}
