import { useCallback, useEffect } from "react"
import {
	addListener2,
	createTemplate,
	getPosition,
	testBracket,
	voidlessLangs,
	voidTags,
} from "../utils/local"
import { CodeBlockProps, PrismCodeBlock } from "."
import { useStableRef } from "../core"
import { addOverlay } from "../utils"

let counter = 0
let sp: number

const createTooltip = createTemplate(
	"<div class=pce-tooltip style=z-index:5;top:auto;display:flex><div></div><div class=pce-hover-tooltip style=flex-shrink:0>",
)

const getLanguageAt = (token: Element) => {
	return /language-(\S*)/.exec(token.closest("[class*=language-")!.className)![1]
}

type HoverCallback = (
	types: string[],
	language: string,
	text: string,
	element: HTMLSpanElement,
) => (string | Node)[] | null | undefined

const HoverDescriptions = ({
	callback,
	codeBlock,
	above,
	maxWidth,
	maxHeight,
}: {
	callback: HoverCallback
	codeBlock: PrismCodeBlock
	props: CodeBlockProps
	/** Whether the prefered position of the tooltip is above the token. @default false */
	above?: boolean
	/** A CSS length value for the tooltip's max width. */
	maxWidth?: string
	/** A CSS length value for the tooltip's max height. */
	maxHeight?: string
}): undefined => {
	const props = useStableRef<[string | undefined, string | undefined, boolean, HoverCallback]>(
		[] as any,
	)
	props[0] = maxWidth
	props[1] = maxHeight
	props[2] = !!above
	props[3] = callback

	useEffect(() => {
		let current: HTMLSpanElement
		const container = createTooltip() as HTMLDivElement
		const pre = codeBlock.container!
		const style = container.style
		const [spacer, tooltip] = container.children as HTMLCollectionOf<HTMLDivElement>
		const wrapper = codeBlock.wrapper!
		const id = (tooltip.id = "pce-hover-" + counter++)

		const show = (target: HTMLElement) => {
			const types = target.className.slice(6).split(" ")
			const text = target.textContent!
			const [maxWidth, maxHeight, above, callback] = props
			const content = callback(types, getLanguageAt(target), text, target)
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
				current?.removeAttribute("aria-describedby")
				target.setAttribute("aria-describedby", id)
				current = target
			} else hide()
		}

		const hide = () => {
			current?.removeAttribute("aria-describedby")
			container.remove()
		}

		const cleanUp = addListener2(wrapper, "pointerover", e => {
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

		addListener2(tooltip, "pointerleave", hide)

		return () => {
			hide(), cleanUp()
		}
	}, [])
}

/**
 * Highlights bracket pairs when hovered. Clicking on a pair keeps it highlighted.
 * Clicking anywhere inside the codeblock removes the highlight.
 *
 * The order inside the `openingBrackets` and `closingBrackets` props determines which
 * tokens are matched together.
 */
const HighlightBracketPairsOnHover = ({
	openingBrackets = "([{",
	closingBrackets = ")]}",
	codeBlock,
	props,
}: {
	openingBrackets?: string
	closingBrackets?: string
	codeBlock: PrismCodeBlock
	props: CodeBlockProps
}): undefined => {
	useHighlightOnHover<number>(
		codeBlock,
		props,
		"active-bracket",
		"punctuation",
		useCallback(
			(token, stack, map) => {
				const text = token.textContent!
				const last = text.length - 1
				const openingType = testBracket(text, openingBrackets, last)
				const bracketType = openingType || testBracket(text, closingBrackets, last)

				if (bracketType) {
					if (openingType) stack[sp++] = [token, openingType]
					else {
						for (let i = sp; i; ) {
							let [el, type] = stack[--i]
							if (bracketType == type) {
								map.set(token, el)
								map.set(el, token)
								if (el.nextSibling == token) {
									el.textContent += token.textContent!
									token.textContent = ""
								}
								sp = i
								i = 0
							}
						}
					}
				}
			},
			[openingBrackets, closingBrackets],
		),
	)
}

/**
 * Highlights tag pairs when a tagname is hovered. Clicking on a pair keeps it
 * highlighted. Clicking anywhere inside the codeblock removes the highlight.
 * @param codeBlock Code block to add tag pair highlighting to.
 */
const HighlightTagPairsOnHover = ({
	codeBlock,
	props,
}: {
	codeBlock: PrismCodeBlock
	props: CodeBlockProps
}): undefined => {
	const partialTags: [Element, boolean][] = []
	const matchTag = (
		nameEl: Element,
		isClosing: boolean,
		lastChild: Element,
		stack: [Element, string][],
		map: WeakMap<Element, Element>,
	) => {
		const tagName = nameEl.textContent!
		const notSelfClosing =
			!lastChild.textContent![1] &&
			(voidlessLangs.has(getLanguageAt(nameEl)) || !voidTags.test(tagName))
		if (notSelfClosing) {
			if (isClosing) {
				for (let i = sp; i; ) {
					let entry = stack[--i]
					if (tagName == entry[1]) {
						map.set(nameEl, entry[0])
						map.set(entry[0], nameEl)
						sp = i
						i = 0
					}
				}
			} else {
				stack[sp++] = [nameEl, tagName]
			}
		}
	}

	useHighlightOnHover<string>(
		codeBlock,
		props,
		"active-tagname",
		"tag",
		useStableRef((token, stack, map) => {
			const children = token.children
			const text = token.textContent!
			const lastChild = children[children.length - 1]
			const second = children[1]
			const hasClosingPunctuation = lastChild?.matches(".punctuation")

			if (second?.matches(".tag")) {
				if (hasClosingPunctuation) {
					matchTag(second, text[1] == "/", lastChild, stack, map)
				} else {
					partialTags.push([second, text[1] == "/"])
				}
			} else if (hasClosingPunctuation && partialTags[0]) {
				matchTag(...partialTags.pop()!, lastChild, stack, map)
			}
		}),
	)
}

type TokenCallback<T> = (
	token: HTMLSpanElement,
	stack: [Element, T][],
	map: WeakMap<Element, Element>,
) => void

const useHighlightOnHover = <T>(
	codeBlock: PrismCodeBlock,
	props: CodeBlockProps,
	highlightClass: string,
	tokenName: string,
	forEachToken: TokenCallback<T>,
) => {
	useEffect(() => {
		let cache: WeakMap<Element, Element> | null
		const active: [Element[], Element[]] = [[], []]
		const wrapper = codeBlock.wrapper!
		const toggleHighlight = (index: 0 | 1, add?: boolean) =>
			active[index].forEach(el => el.classList.toggle(highlightClass, !!add))

		const setCache = () => {
			cache = new WeakMap()
			let tokens = wrapper.getElementsByClassName(tokenName)
			let i = (sp = 0)
			let stack: [Element, T][] = []
			let token: HTMLSpanElement
			while ((token = tokens[i++] as HTMLSpanElement)) {
				forEachToken(token, stack, cache)
			}
		}

		const handler = (e: PointerEvent) => {
			const target = (e.target as Element).closest("." + tokenName)!
			const index = e.type == "click" ? 0 : 1

			if (active[0].includes(target)) return
			if (index && (e.pointerType != "mouse" || e.buttons)) return
			if (!cache) setCache()

			toggleHighlight(index)
			active[index] = []
			const other = cache!.get(target)
			if (other) {
				active[1] = []
				active[index] = [target, other]
				toggleHighlight(index, true)
			}
		}

		const cleanUps = [
			// @ts-expect-error Allow PointerEvent
			addListener2(wrapper, "click", handler),
			addListener2(wrapper, "pointerover", handler),
			addListener2(wrapper, "pointerleave", () => {
				toggleHighlight(1)
				active[1] = []
			}),
		]

		return () => cleanUps.forEach(c => c())
	}, [
		props.code,
		props.language,
		// (props.preserveIndent ?? !!props.wordWrap) && (props.tabSize ?? 2),
		props.preserveIndent,
		props.wordWrap,
		props.tabSize,
		props.onTokenize,
		forEachToken,
	])
}

export { HighlightTagPairsOnHover, HighlightBracketPairsOnHover, HoverDescriptions }
