import { Extension, InputSelection, PrismEditor } from "../.."
import { isChrome, isMac, getModifierCode, createTemplate } from "../../core"
import { escapeRegExp, getLines } from "../../utils"
import { createReplaceAPI } from "./replace"

const template = createTemplate(
	'<div class="prism-search"><button aria-expanded="false" title="Toggle Replace" class="expand-search"></button><div spellcheck="false"><div><div class="input find"><input autocorrect="off" autocapitalize="off" placeholder="Find" aria-label="Find"><button class="prev-match" title="Previous Match (Shift+Enter)"></button><button class="next-match" title="Next Match (Enter)"></button><div class="search-error"></div></div><button class="search-close" title="Close (Esc)"></button></div><div class="input replace"><input autocorrect="off" autocapitalize="off" placeholder="Replace" aria-label="Replace"><button title="(Enter)">Replace</button><button title="(Ctrl+Alt+Enter)">All</button></div><div class="search-options"><div class="match-count">0<span> of </span>0</div><button aria-pressed="false" class="use-regexp" title="RegExp Search (Alt+R)"><span aria-hidden="true"></span></button><button aria-pressed="false" title="Match Case (Alt+C)"><span aria-hidden="true">Aa</span></button><button aria-pressed="false" class="whole-word" title="Match Whole Word (Alt+W)"><span aria-hidden="true">ab</span></button><button aria-pressed="false" class="find-in-selection" title="Find in Selection (Alt+L)"></button></div></div></div>',
	"display:none;align-items:flex-start;justify-content:flex-end;left:var(--padding-left);",
	"prism-search-container",
)

const toggleAttr = (
	el: Element,
	name: string, // @ts-ignore
) => el.setAttribute(name, el.getAttribute(name) == "false")

const getStyleValue = <T extends keyof CSSStyleDeclaration>(el: HTMLElement, prop: T) =>
	parseFloat(<string>getComputedStyle(el)[prop])

export interface SearchWidget extends Extension {
	readonly widgetEl: HTMLDivElement
	close: (focusTextarea?: boolean) => void
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
		marginTop: number,
		search: HTMLDivElement,
		initialized: boolean

	return {
		update(editor: PrismEditor) {
			if (initialized == (initialized = true)) return

			const container = <HTMLDivElement>template.cloneNode(true),
				[toggle, div] = <[HTMLButtonElement, HTMLDivElement]>(
					(<unknown>(search = <HTMLDivElement>container.firstElementChild).children)
				),
				rows = div.children,
				[findContainer, closeEl] = <[HTMLDivElement, HTMLButtonElement]>(<unknown>rows[0].children),
				[findInput, prevEl, nextEl, errorEl] = <
					[HTMLInputElement, HTMLButtonElement, HTMLButtonElement, HTMLDivElement]
				>(<unknown>findContainer.children),
				[replaceInput, replaceEl, replaceAllEl] = <
					[HTMLInputElement, HTMLButtonElement, HTMLButtonElement]
				>(<unknown>rows[1].children),
				[matchCount, useRegExpEl, matchCaseEl, wholeWordEl, inSelectionEl] = <
					[
						HTMLDivElement,
						HTMLButtonElement,
						HTMLButtonElement,
						HTMLButtonElement,
						HTMLButtonElement,
					]
				>(<unknown>rows[2].children),
				[current, , total] = <Text[]>(<unknown>matchCount.childNodes),
				{ textarea, wrapper, overlays, scrollContainer, getSelection: selection } = editor,
				replaceAPI = createReplaceAPI(editor)

			const getSelectedWord = () => {
				let [start, end] = selection(),
					value = editor.value
				if (start != end) return value.slice(start, end)
				if (/\w/.test(value[start] || "")) start += 1
				const newStart = value.slice(0, start).match(/\b\w*\b$/)?.[0]
				return newStart ? newStart + (value.slice(start).match(/^\b\w*\b/)?.[0] || "") : ""
			}

			const startSearch = (selectMatch?: boolean) => {
				const result = replaceAPI.search(
						findInput.value,
						matchCase,
						wholeWord,
						useRegExp,
						searchSelection,
					),
					isError = typeof result == "string",
					index = isError ? -1 : replaceAPI.closest()
				// @ts-ignore
				current.data = index + 1 // @ts-ignore
				total.data = replaceAPI.matches.length
				findContainer.classList.toggle("has-error", isError)

				if (isError) errorEl.textContent = result
				else selectMatch && replaceAPI.selectMatch(index, prevMargin)
			}

			const keydown = (e: KeyboardEvent) => {
				// F or G + Ctrl/Cmd
				if (e.keyCode >> 1 == 35 && getModifierCode(e) == (isMac ? 0b0100 : 0b0010)) {
					e.preventDefault()
					let word = getSelectedWord()
					open(true)
					if (/^$|\n/.test(word)) startSearch()
					else {
						if (useRegExp) word = escapeRegExp(word)
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
					const diff = prevLength - (prevLength = editor.value.length),
						[, end] = currentSelection,
						[searchStart, searchEnd] = searchSelection

					if (end <= searchEnd) {
						searchSelection[1] -= diff
						if (end <= searchStart - +(diff < 0)) searchSelection[0] -= diff
					}
				}
				if (selectNext) replaceInput.focus()
				startSearch(selectNext != (selectNext = false))
			}

			const open = (this.open = (focusInput?: boolean) => {
				if (isOpen != (isOpen = true)) {
					if (marginTop == null) prevMargin = marginTop = getStyleValue(wrapper, "marginTop")
					editor.addListener("update", input)
					textarea.addEventListener("beforeinput", beforeinput)
					container.style.display = "flex"
					updateMargin()
					resize()
					observer?.observe(scrollContainer)
				}
				if (focusInput) findInput.focus(), findInput.select()
			})

			const close = (this.close = (focusTextarea?: boolean) => {
				if (isOpen != (isOpen = false)) {
					replaceAPI.stopSearch()
					editor.removeListener("update", input)
					textarea.removeEventListener("beforeinput", input)
					container.style.display = "none"
					updateMargin()
					observer?.disconnect()
					focusTextarea && textarea.focus()
				}
			})

			const move = (next?: boolean) => {
				if (replaceAPI.matches.length) {
					const index = replaceAPI[next ? "next" : "prev"]()
					replaceAPI.selectMatch(index, prevMargin) // @ts-ignore
					current.data = index + 1
				}
			}

			const updateMargin = () => {
				const newMargin = isOpen
					? getStyleValue(search, "top") + getStyleValue(search, "height")
					: marginTop

				wrapper.style.marginTop = newMargin + "px"
				scrollContainer.scrollBy(0, newMargin - prevMargin)
				prevMargin = newMargin
			}

			const resize = () =>
				div.style.setProperty(
					"--search-width",
					`min(${
						(scrollContainer.clientWidth / getStyleValue(div, "fontSize")) * 0.9
					}em - var(--padding-left) - var(--padding-inline), 20em)`,
				)

			const observer = window.ResizeObserver ? new ResizeObserver(resize) : null

			const elementHandlerMap = new Map<HTMLElement, () => any>([
				[nextEl, () => move(true)],
				[prevEl, () => move()],
				[closeEl, () => close(true)],
				[
					replaceEl,
					() => {
						if (!textarea.readOnly) {
							selectNext = true
							replaceAPI.replace(replaceInput.value)
						}
					},
				],
				[
					replaceAllEl,
					() => {
						if (!textarea.readOnly) replaceAPI.replaceAll(replaceInput.value, searchSelection)
					},
				],
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

			textarea.addEventListener("keydown", keydown)

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
				if (target.matches(".search-options button")) {
					toggleAttr(target, "aria-pressed")
					startSearch(true)
				}
			})

			findInput.oninput = () => startSearch(true)

			container.addEventListener("keydown", e => {
				const shortcut = getModifierCode(e),
					target = <HTMLElement>e.target,
					key = e.key,
					isFind = target == findInput
				if (shortcut == 1) {
					const input =
						key == "c"
							? matchCaseEl
							: key == "w"
							? wholeWordEl
							: key == "r"
							? useRegExpEl
							: key == "l"
							? inSelectionEl
							: null

					if (input) e.preventDefault(), input.click()
				} else if (key == "Enter" && target.tagName == "INPUT") {
					e.preventDefault()
					if (!shortcut) (isFind ? nextEl : replaceEl).click()
					else if (shortcut == 8 && isFind) prevEl.click()
					else if (shortcut == 3 && !isFind) replaceAllEl.click()
				} else if (!shortcut && key == "Escape") close(true)
				else keydown(e)
			})

			overlays.append(container)
			replaceAPI.container.className = "search-matches"
		},
		get widgetEl() {
			return search
		},
		close() {},
		open() {},
	}
}
