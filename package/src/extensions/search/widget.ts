import { InputSelection, BasicExtension, isWebKit } from "../../index.js"
import {
	isChrome,
	isMac,
	createTemplate,
	preventDefault,
	addTextareaListener,
	numLines,
} from "../../core.js"
import { regexEscape, getModifierCode } from "../../utils/index.js"
import { createReplaceAPI } from "./replace.js"
import { addListener, getLineEnd, getLineStart, getStyleValue } from "../../utils/local.js"

const shortcut = ` (Alt+${isMac ? "Cmd+" : ""}`

const template = createTemplate(
	`<div class=prism-search-container style=display:flex;align-items:flex-start;justify-content:flex-end><div dir=ltr class=prism-search><button type=button aria-expanded=false title="Toggle Replace" class=pce-expand></button><div spellcheck=false><div><div class="pce-input pce-find"><input autocorrect=off autocapitalize=off placeholder=Find aria-label=Find><button type=button class=prev-match title="Previous Match (Shift+Enter)"></button><button type=button class=next-match title="Next Match (Enter)"></button><div class=search-error></div></div><button type=button class=pce-close title="Close (Esc)"></button></div><div class="pce-input pce-replace"><input autocorrect=off autocapitalize=off placeholder=Replace aria-label=Replace><button type=button title=(Enter)>Replace</button><button type=button title=(${
		isMac ? "Cmd" : "Ctrl+Alt"
	}+Enter)>All</button></div><div class=pce-options><div class=pce-match-count>0<span> of </span>0</div><button type=button aria-pressed=false class=pce-regex title="RegExp Search${shortcut}R)"><span aria-hidden=true></span></button><button type=button aria-pressed=false title="Preserve Case${shortcut}P)"><span aria-hidden=true>Aa</span></button><button type=button aria-pressed=false class=pce-whole title="Match Whole Word${shortcut}W)"><span aria-hidden=true>ab</span></button><button type=button aria-pressed=false class=pce-in-selection title="Find in Selection${shortcut}L)">`,
)

const toggleAttr = (el: Element, name: string) =>
	el.setAttribute(name, <any>(el.getAttribute(name) == "false"))

export interface SearchWidget extends BasicExtension {
	/** The search widget's outer element. */
	readonly element: HTMLDivElement
	/**
	 * Hides the search widget and removes most event listeners.
	 * @param focusTextarea Whether the editor's `textarea` should gain focus. Defaults to true.
	 */
	close: (focusTextarea?: boolean) => void
	/**
	 * Opens the search widget.
	 * @param focusInput Whether the widgets's search input should gain focus. Defaults to true.
	 */
	open: (focusInput?: boolean) => void
}

/**
 * Extension that adds a widget for search and replace functionality.
 * This extension needs styles from `prism-code-editor/search.css`.
 */
export const searchWidget = (): SearchWidget => {
	let prevLength: number
	let useRegExp: boolean
	let matchCase: boolean
	let wholeWord: boolean
	let searchSelection: [number, number] | undefined
	let isOpen: boolean
	let currentSelection: InputSelection
	let prevUserSelection: InputSelection
	let prevMargin: number
	let selectNext = false
	let marginTop: number

	const self: SearchWidget = editor => {
		editor.extensions.searchWidget = self

		const { textarea, wrapper, overlays, scrollContainer, getSelection } = editor
		const replaceAPI = createReplaceAPI(editor)

		const startSearch = (selectMatch?: boolean) => {
			if (selectMatch && !isWebKit) textarea.setSelectionRange(...prevUserSelection)
			const error = replaceAPI.search(
				findInput.value,
				matchCase,
				wholeWord,
				useRegExp,
				searchSelection,
			)
			const index = error ? -1 : selectNext ? replaceAPI.next() : replaceAPI.closest()

			current.data = <any>index + 1
			total.data = <any>replaceAPI.matches.length
			findContainer.classList.toggle("pce-error", !!error)

			if (error) errorEl.textContent = error
			else if (selectMatch || selectNext) replaceAPI.selectMatch(index, prevMargin)
		}

		const keydown = (e: KeyboardEvent) => {
			// F or G + Ctrl/Cmd
			if (e.keyCode >> 1 == 35 && getModifierCode(e) == (isMac ? 0b0100 : 0b0010)) {
				preventDefault(e)
				open()
				let [start, end] = getSelection(),
					value = editor.value,
					word =
						value.slice(start, end) ||
						value.slice(0, start).match(/[_\p{N}\p{L}]*$/u)![0] +
							value.slice(start).match(/^[_\p{N}\p{L}]*/u)![0]
				if (/^$|\n/.test(word)) startSearch()
				else {
					if (useRegExp) word = regexEscape(word)
					document.execCommand("insertText", false, word)
					findInput.select()
				}
			}
		}

		const open = (focusInput = true) => {
			if (!isOpen) {
				isOpen = true
				if (marginTop == null) prevMargin = marginTop = getStyleValue(wrapper, "marginTop")
				prevUserSelection = getSelection()
				overlays.append(container)
				updateMargin()
				resize()
				observer?.observe(scrollContainer)
			}
			if (focusInput) findInput.select()
		}

		const close = (self.close = (focusTextarea = true) => {
			if (isOpen) {
				isOpen = false
				replaceAPI.stopSearch()
				container.remove()
				updateMargin()
				observer?.disconnect()
				focusTextarea && textarea.focus()
			}
		})

		const move = (next?: boolean) => {
			if (replaceAPI.matches[0]) {
				const index = replaceAPI[next ? "next" : "prev"]()
				replaceAPI.selectMatch(index, prevMargin)
				current.data = <any>index + 1
			}
		}

		const updateMargin = () => {
			const newMargin = isOpen
				? getStyleValue(search, "top") + getStyleValue(search, "height")
				: marginTop
			const newScroll = scrollContainer.scrollTop + newMargin - prevMargin

			wrapper.style.marginTop = isOpen ? newMargin + "px" : ""
			scrollContainer.scrollTop = newScroll
			prevMargin = newMargin
		}

		const resize = () =>
			div.style.setProperty(
				"--search-width",
				`min(${scrollContainer.clientWidth - 2}px - 2.4em - var(--padding-left),20em)`,
			)

		const observer = window.ResizeObserver && new ResizeObserver(resize)

		const replace = () => {
			selectNext = true
			const index = replaceAPI.replace(replaceInput.value)
			if (index != null) {
				current.data = <any>(index + 1)
				replaceAPI.selectMatch(index, prevMargin)
			}
			selectNext = false
		}

		const replaceAll = () => {
			replaceAPI.replaceAll(replaceInput.value)
		}

		const keyCodeButtonMap: Record<string, HTMLButtonElement> = {
			80 /* P */: matchCaseEl,
			87 /* W */: wholeWordEl,
			82 /* R */: useRegExpEl,
			76 /* L */: inSelectionEl,
		}

		const elementHandlerMap = new Map<HTMLElement, () => any>([
			[nextEl, () => move(true)],
			[prevEl, move],
			[closeEl, close],
			[replaceEl, replace],
			[replaceAllEl, replaceAll],
			[
				toggle,
				() => {
					toggleAttr(toggle, "aria-expanded")
					updateMargin()
				},
			],
			[matchCaseEl, () => (matchCase = !matchCase)],
			[useRegExpEl, () => (useRegExp = !useRegExp)],
			[wholeWordEl, () => (wholeWord = !wholeWord)],
			[
				inSelectionEl,
				() => {
					const value = editor.value
					if (searchSelection) searchSelection = undefined
					else {
						searchSelection = <[number, number]>getSelection().slice(0, 2)

						if (numLines(value, ...searchSelection) > 1) {
							searchSelection = [
								getLineStart(value, searchSelection[0]),
								getLineEnd(value, searchSelection[1]),
							]
						}
					}
					prevLength = value.length
				},
			],
		])

		addTextareaListener(editor, "keydown", keydown)
		addTextareaListener(editor, "beforeinput", () => {
			if (isOpen && searchSelection) currentSelection = getSelection()
		})
		addListener(editor, "update", () => {
			if (!isOpen) return
			if (searchSelection && currentSelection) {
				// This preserves the selection well for normal typing,
				// but for indenting, toggling comments, etc. it doesn't
				const diff = prevLength - (prevLength = editor.value.length)
				const end = currentSelection[1]

				if (end <= searchSelection[1]) {
					searchSelection[1] -= diff
					if (end <= searchSelection[0] - +(diff < 0)) searchSelection[0] -= diff
				}
			}
			startSearch()
		})
		addListener(editor, "selectionChange", selection => {
			if (isOpen && editor.focused) prevUserSelection = selection
		})

		// Patches a bug where Chrome lies about the textarea's selection
		if (isChrome) {
			container.addEventListener("focusin", e => {
				if (!container.contains(<Element>e.relatedTarget)) {
					findInput.focus()
					;(<HTMLElement>e.target).focus()
				}
			})
		}
		container.addEventListener("click", e => {
			const target = <HTMLElement>e.target
			const remove = addListener(editor, "update", () => target.focus())
			elementHandlerMap.get(target)?.()
			if (target.matches(".pce-options>button")) {
				toggleAttr(target, "aria-pressed")
				startSearch(true)
			}
			remove()
		})

		findInput.oninput = () => isOpen && startSearch(true)

		container.addEventListener("keydown", e => {
			const shortcut = getModifierCode(e)
			const target = <HTMLElement>e.target
			const keyCode = e.keyCode
			const isFind = target == findInput
			if (shortcut == (isMac ? 5 : 1)) {
				if (keyCodeButtonMap[keyCode]) {
					preventDefault(e)
					keyCodeButtonMap[keyCode].click()
				}
			} else if (keyCode == 13 && target.tagName == "INPUT") {
				preventDefault(e)
				if (!shortcut) isFind ? move(true) : replaceEl.click()
				else if (shortcut == 8 && isFind) move()
				else if (shortcut == (isMac ? 4 : 3) && !isFind) replaceAllEl.click()
				target.focus()
			} else if (!shortcut && keyCode == 27) close()
			else keydown(e)
		})

		self.open = focusInput => {
			open(focusInput)
			startSearch()
		}

		replaceAPI.container.className = "pce-matches"
	}

	const container = <HTMLDivElement>template()
	// @ts-expect-error
	const search = (self.element = <HTMLDivElement>container.firstChild)
	const [toggle, div] = <[HTMLButtonElement, HTMLDivElement]>(<unknown>search.children)
	const rows = div.children
	const [findContainer, closeEl] = <[HTMLDivElement, HTMLButtonElement]>(<unknown>rows[0].children)
	const [findInput, prevEl, nextEl, errorEl] = <
		[HTMLInputElement, HTMLButtonElement, HTMLButtonElement, HTMLDivElement]
	>(<unknown>findContainer.children)
	const [replaceInput, replaceEl, replaceAllEl] = <
		[HTMLInputElement, HTMLButtonElement, HTMLButtonElement]
	>(<unknown>rows[1].children)
	const [matchCount, useRegExpEl, matchCaseEl, wholeWordEl, inSelectionEl] = <
		[HTMLDivElement, HTMLButtonElement, HTMLButtonElement, HTMLButtonElement, HTMLButtonElement]
	>(<unknown>rows[2].children)
	const [current, , total] = <Text[]>(<unknown>matchCount.childNodes)

	self.open = self.close = () => {}

	return self
}
