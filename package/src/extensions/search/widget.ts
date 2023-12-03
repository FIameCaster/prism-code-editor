import { Extension, InputSelection, PrismEditor } from "../.."
import { isChrome, isMac, createTemplate, preventDefault } from "../../core"
import { regexEscape, getLines, getModifierCode } from "../../utils"
import { createReplaceAPI } from "./replace"

const template = createTemplate(
	'<div dir="ltr" class="prism-search"><button aria-expanded="false" title="Toggle Replace" class="pce-expand"></button><div spellcheck="false"><div><div class="pce-input pce-find"><input autocorrect="off" autocapitalize="off" placeholder="Find" aria-label="Find"><button class="prev-match" title="Previous Match (Shift+Enter)"></button><button class="next-match" title="Next Match (Enter)"></button><div class="search-error"></div></div><button class="pce-close" title="Close (Esc)"></button></div><div class="pce-input pce-replace"><input autocorrect="off" autocapitalize="off" placeholder="Replace" aria-label="Replace"><button title="(Enter)">Replace</button><button>All</button></div><div class="pce-options"><div class="pce-match-count">0<span> of </span>0</div><button aria-pressed="false" class="pce-regex"><span aria-hidden="true"></span></button><button aria-pressed="false"><span aria-hidden="true">Aa</span></button><button aria-pressed="false" class="pce-whole"><span aria-hidden="true">ab</span></button><button aria-pressed="false" class="pce-in-selection"></button></div></div></div>',
	"display:none;align-items:flex-start;justify-content:flex-end;",
	"prism-search-container",
)

const toggleAttr = (el: Element, name: string) =>
	el.setAttribute(name, <any>(el.getAttribute(name) == "false"))

const getStyleValue = <T extends keyof CSSStyleDeclaration>(el: HTMLElement, prop: T) =>
	parseFloat(<string>getComputedStyle(el)[prop])

export interface SearchWidget extends Extension {
	/** The search widget's outer element. */
	readonly widgetEl: HTMLDivElement
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
	let prevLength: number,
		useRegExp: boolean,
		matchCase: boolean,
		wholeWord: boolean,
		searchSelection: [number, number] | undefined,
		isOpen: boolean,
		currentSelection: InputSelection,
		prevMargin: number,
		selectNext = false,
		marginTop: number

	const container = <HTMLDivElement>template.cloneNode(true),
		search = <HTMLDivElement>container.firstChild,
		[toggle, div] = <[HTMLButtonElement, HTMLDivElement]>(<unknown>search.children),
		rows = div.children,
		[findContainer, closeEl] = <[HTMLDivElement, HTMLButtonElement]>(<unknown>rows[0].children),
		[findInput, prevEl, nextEl, errorEl] = <
			[HTMLInputElement, HTMLButtonElement, HTMLButtonElement, HTMLDivElement]
		>(<unknown>findContainer.children),
		[replaceInput, replaceEl, replaceAllEl] = <
			[HTMLInputElement, HTMLButtonElement, HTMLButtonElement]
		>(<unknown>rows[1].children),
		[matchCount, useRegExpEl, matchCaseEl, wholeWordEl, inSelectionEl] = <
			[HTMLDivElement, HTMLButtonElement, HTMLButtonElement, HTMLButtonElement, HTMLButtonElement]
		>(<unknown>rows[2].children),
		[current, , total] = <Text[]>(<unknown>matchCount.childNodes)

	return {
		update(editor: PrismEditor) {
			this.update = () => {}
			editor.extensions.searchWidget = this

			const { textarea, wrapper, overlays, scrollContainer, getSelection: selection } = editor,
				replaceAPI = createReplaceAPI(editor)

			const startSearch = (selectMatch?: boolean) => {
				const error = replaceAPI.search(
						findInput.value,
						matchCase,
						wholeWord,
						useRegExp,
						searchSelection,
					),
					index = error ? -1 : selectNext ? replaceAPI.next() : replaceAPI.closest()

				current.data = <any>index + 1
				total.data = <any>replaceAPI.matches.length
				findContainer.classList.toggle("pce-error", !!error)

				if (error) errorEl.textContent = error
				else selectMatch && replaceAPI.selectMatch(index, prevMargin)
			}

			const keydown = (e: KeyboardEvent) => {
				// F or G + Ctrl/Cmd
				if (e.keyCode >> 1 == 35 && getModifierCode(e) == (isMac ? 0b0100 : 0b0010)) {
					preventDefault(e)
					open()
					let [start, end] = selection(),
						value = editor.value,
						word =
							value.slice(start, end) ||
							value.slice(0, start).match(/[\p{L}_\d]*$/u)![0] +
								value.slice(start).match(/^[\p{L}_\d]*/u)![0]
					if (/^$|\n/.test(word)) startSearch()
					else {
						if (useRegExp) word = regexEscape(word)
						document.execCommand("insertText", false, word) || (findInput.value = word)
						findInput.select()
					}
				}
			}

			const beforeinput = () => {
				if (searchSelection) currentSelection = selection()
			}

			const input = () => {
				if (searchSelection) {
					// This preserves the selection well for normal typing,
					// but for indenting, toggling comments, etc. it doesn't
					const diff = prevLength - (prevLength = editor.value.length),
						[, end] = currentSelection,
						[searchStart, searchEnd] = searchSelection

					if (end <= searchEnd) {
						searchSelection[1] -= diff
						if (end <= searchStart - +(diff < 0)) searchSelection[0] -= diff
					}
				}
				startSearch(selectNext)
				selectNext = false
			}

			const open = (focusInput = true) => {
				if (!isOpen) {
					isOpen = true
					if (marginTop == null) prevMargin = marginTop = getStyleValue(wrapper, "marginTop")
					editor.addListener("update", input)
					textarea.addEventListener("beforeinput", beforeinput)
					container.style.display = "flex"
					updateMargin()
					resize()
					observer?.observe(scrollContainer)
				}
				if (focusInput) findInput.focus(), findInput.select()
			}

			const close = (this.close = (focusTextarea = true) => {
				if (isOpen) {
					isOpen = false
					replaceAPI.stopSearch()
					editor.removeListener("update", input)
					textarea.removeEventListener("beforeinput", beforeinput)
					container.style.display = "none"
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
						: marginTop,
					newScroll = scrollContainer.scrollTop + newMargin - prevMargin

				wrapper.style.marginTop = newMargin + "px"
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
				replaceAPI.replace(replaceInput.value)
			}

			const replaceAll = () => {
				replaceAPI.replaceAll(replaceInput.value)
			}

			const keyButtonMap: Record<string, HTMLButtonElement> = {
				p: matchCaseEl,
				w: wholeWordEl,
				r: useRegExpEl,
				l: inSelectionEl,
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
							searchSelection = <[number, number]>selection().slice(0, 2)

							if (/\n/.test(value.slice(...searchSelection!)))
								searchSelection = <[number, number]>getLines(value, ...searchSelection!).slice(1)
						}
						prevLength = value.length
					},
				],
			])

			const shortcut = ` (Alt+${isMac ? "Cmd+" : ""}`

			matchCaseEl.title = `Preserve Case${shortcut}P)`
			wholeWordEl.title = `Match Whole Word${shortcut}W)`
			useRegExpEl.title = `RegExp Search${shortcut}R)`
			inSelectionEl.title = `Find in Selection${shortcut}L)`
			replaceAllEl.title = `(${isMac ? "Cmd" : "Ctrl+Alt"}+Enter)`

			textarea.addEventListener("keydown", keydown)

			// Patches a selection bug when moving focus from the textarea to the buttons on the widget
			isChrome &&
				container.addEventListener("focusin", e => {
					if (e.relatedTarget == textarea) {
						findInput.focus()
						;(<HTMLElement>e.target).focus()
					}
				})

			container.addEventListener("click", e => {
				const target = <HTMLElement>e.target
				elementHandlerMap.get(<HTMLElement>target)?.()
				if (target.matches("input~*")) target.focus()
				if (target.matches(".pce-options>button")) {
					toggleAttr(target, "aria-pressed")
					startSearch(true)
					e.isTrusted && target.focus()
				}
			})

			findInput.oninput = () => isOpen && startSearch(true)

			container.addEventListener("keydown", e => {
				const shortcut = getModifierCode(e),
					target = <HTMLElement>e.target,
					key = e.key,
					isFind = target == findInput
				if (shortcut == (isMac ? 5 : 1)) {
					let input = keyButtonMap[isMac ? e.code[3].toLowerCase() : key]
					if (input) {
						preventDefault(e)
						input.click()
						target.focus()
					}
				} else if (key == "Enter" && target.tagName == "INPUT") {
					preventDefault(e)
					if (!shortcut) isFind ? move(true) : replace()
					else if (shortcut == 8 && isFind) move()
					else if (shortcut == (isMac ? 4 : 3) && !isFind) replaceAll()
					target.focus()
				} else if (!shortcut && key == "Escape") close()
				else keydown(e)
			})

			this.open = focusInput => {
				open(focusInput)
				startSearch()
			}

			overlays.append(container)
			replaceAPI.container.className = "pce-matches"
		},
		widgetEl: search,
		close() {},
		open() {},
	}
}
