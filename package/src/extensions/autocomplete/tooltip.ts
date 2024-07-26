import { BasicExtension } from "../.."
import { addTextareaListener, createTemplate, preventDefault } from "../../core"
import { addTooltip } from "../../tooltips"
import { getLanguage, getLineBefore, getModifierCode, insertText, prevSelection } from "../../utils"
import { Cursor } from "../cursor"
import { CompletionFilter } from "./filter"
import { Completion, CompletionContext, CompletionDefinition } from "./types"

let count = 0

const template = createTemplate("<div class=pce-ac-tooltip><ul role=listbox>")
const rowTemplate = createTemplate(
	"<li class=pce-ac-row role=option><div> <span> </span> </div><div class=pce-ac-details> ",
)
const matchTemplate = createTemplate("<span> ")

const map: Record<string, CompletionDefinition<any>> = {}

/**
 * Registers completion sources for a set of languages.
 * If any of the languages already have completion sources, they're overridden.
 * @param langs Array of languages you want the completions to apply for.
 * @param definition Defines the completion sources for the languages along with additional
 * properties on the context passed to the completion sources.
 */
const registerCompletions = <T extends object>(
	langs: string[],
	definition: CompletionDefinition<T>,
) => {
	langs.forEach(lang => (map[lang] = definition))
}

export type AutoCompleteConfig = {
	/** Function used to filter and rank options. */
	filter: CompletionFilter
	/**
	 * If `true`, the tooltip will be placed above the cursor when there's space.
	 * Defaults to `false`.
	 */
	preferAbove?: boolean
	/**
	 * Whether the tooltip is closed when the `textarea` loses focus. Defaults to `true`.
	 */
	closeOnBlur?: boolean
	/**
	 * If `true`, the tooltip will only be shown when explicitly opened using Ctrl+Space.
	 * Defaults to `false`.
	 */
	explicitOnly?: boolean
}

/**
 * Extension adding basic auto-complete to an editor. For auto-completion to work, you need to
 * {@link registerCompletions} for specific languages.
 *
 * @param config Object used to configure the extension. The `filter` property is required.
 */
const autoComplete =
	(config: AutoCompleteConfig): BasicExtension =>
	editor => {
		let isTyping: boolean
		let isOpen: boolean
		let shouldOpen: boolean
		let currentOptions: [number, number[], number, Completion][]
		let numOptions: number
		let activeIndex: number
		let active: HTMLLIElement | undefined
		let pos: number
		let offset = 0
		let rowHeight: number
		let cursor: Cursor | undefined

		const windowSize = 13
		const textarea = editor.textarea
		const tooltip = template()
		const [show, _hide] = addTooltip(editor, tooltip)
		const list = tooltip.firstChild as HTMLUListElement
		const id = (list.id = "pce-ac-" + count++)
		const rows = list.children as HTMLCollectionOf<HTMLLIElement>
		const add = editor.addListener
		const hide = () => {
			if (isOpen) {
				_hide()
				textarea.removeAttribute("aria-haspopup")
				textarea.removeAttribute("aria-activedescendant")
				isOpen = false
			}
		}

		const updateNode = (node: Text, text: string) => {
			if (node.data != text) node.data = text
		}

		const setRowHeight = () => {
			rowHeight = parseFloat(getComputedStyle(rows[0]).height)
		}

		const updateRow = (index: number) => {
			const option = currentOptions[index + offset]
			const nodes = rows[index].firstChild!.childNodes
			const label = option[3].label
			const matched = option[1]

			let nodeCount = nodes.length - 1
			let pos = 0
			let i = 0
			let l = matched.length

			for (; i < l; ) {
				if (i >= nodeCount) {
					nodes[i].before("", matchTemplate())
				}
				updateNode(nodes[i] as Text, label.slice(pos, (pos = matched[i++])))
				updateNode(nodes[i].firstChild as Text, label.slice(pos, (pos = matched[i++])))
			}
			for (; nodeCount > i; ) {
				nodes[--nodeCount].remove()
			}
			updateNode(nodes[l] as Text, label.slice(pos))
			updateNode(rows[index].lastChild!.firstChild as Text, option[3].detail || "")
		}

		const scrollActiveIntoView = () => {
			setRowHeight()
			const scrollTop = tooltip.scrollTop
			const lower = rowHeight * activeIndex
			const upper = rowHeight * (activeIndex + 1) - tooltip.clientHeight

			tooltip.scrollTop = scrollTop > lower ? lower : scrollTop < upper ? upper : scrollTop
		}

		const updateActive = () => {
			const newActive = rows[activeIndex - offset]
			if (newActive != active) {
				active?.removeAttribute("aria-selected")
				if (newActive) {
					textarea.setAttribute("aria-activedescendant", newActive.id)
					newActive.setAttribute("aria-selected", true as any)
				} else {
					textarea.removeAttribute("aria-activedescendant")
				}
				active = newActive
			}
		}

		const move = (decrement?: boolean) => {
			if (decrement) activeIndex = activeIndex ? activeIndex - 1 : numOptions - 1
			else activeIndex = activeIndex + 1 < numOptions ? activeIndex + 1 : 0
			scrollActiveIntoView()
			updateActive()
		}

		const insertOption = (index: number) => {
			insertText(editor, currentOptions[index][3].label, currentOptions[index][2], pos)
			cursor!.scrollIntoView()
		}

		const startQuery = (explicit = false) => {
			const selection = editor.getSelection()
			const language = getLanguage(editor, (pos = selection[0]))
			const definition = map[language]
			if (definition && (explicit || pos == selection[1])) {
				const value = editor.value
				const lineBefore = getLineBefore(value, pos)
				const before = value.slice(0, pos)
				const context: CompletionContext = {
					before,
					lineBefore,
					language,
					explicit,
					pos,
				}
				const newContext = Object.assign(context, definition.context?.(context, editor))
				const filter = config.filter

				currentOptions = []
				definition.sources.forEach(source => {
					const result = source(newContext, editor)
					if (result) {
						const from = result.from
						const query = before.slice(from)

						result.options.forEach(option => {
							const filterResult = filter(query, option.label)
							if (filterResult) {
								filterResult[0] += option.boost || 0
								// @ts-expect-error Allow mutation
								filterResult.push(from, option)
								// @ts-expect-error Allow mutation
								currentOptions.push(filterResult)
							}
						})
					}
				})

				if (currentOptions[0]) {
					currentOptions.sort((a, b) => b[0] - a[0] || a[3].label.localeCompare(b[3].label))
					numOptions = currentOptions.length
					activeIndex = offset = 0

					for (let i = 0, l = numOptions < windowSize ? numOptions : windowSize; i < l; ) {
						updateRow(i++)
					}

					list.style.paddingTop = ""
					list.style.height = rowHeight ? rowHeight * numOptions + "px" : 1.4 * numOptions + "em"
					tooltip.scrollTop = 0

					isOpen = true
					show(config.preferAbove)
					textarea.setAttribute("aria-haspopup", "listbox")
					updateActive()
				} else hide()
			} else hide()
		}

		textarea.setAttribute("aria-controls", id)
		textarea.setAttribute("aria-autocomplete", "list")

		for (let i = 0; i < windowSize; ) {
			list.append(rowTemplate())
			rows[i].id = id + "-" + i++
		}

		tooltip.onscroll = () => {
			setRowHeight()
			const newOffset = Math.min(Math.floor(tooltip.scrollTop / rowHeight), numOptions - windowSize)
			if (newOffset == offset || newOffset < 0) return

			offset = newOffset
			for (let i = 0; i < windowSize; i) {
				updateRow(i++)
			}

			list.style.paddingTop = offset * rowHeight + "px"
			updateActive()
		}

		add("update", () => {
			isTyping = shouldOpen
			shouldOpen = false
			if (!cursor) {
				if ((cursor = editor.extensions.cursor)) {
					// Must be added after the cursor's selectionChange handler
					add("selectionChange", () => {
						if (isTyping) {
							isTyping = false
							startQuery()
						} else hide()
					})
				}
			}
		})
		addTextareaListener(
			editor,
			"beforeinput",
			e => {
				shouldOpen =
					!config.explicitOnly &&
					(shouldOpen ||
						(e.inputType == "insertText" && !prevSelection) ||
						(e.inputType == "deleteContentBackward" && isOpen))
			},
			true,
		)
		addTextareaListener(editor, "blur", e => {
			if (config.closeOnBlur != false && !list.contains(e.relatedTarget as Element)) hide()
		})
		addTextareaListener(
			editor,
			"keydown",
			e => {
				const key = e.key
				const code = getModifierCode(e)
				const style = tooltip.style
				const height = editor.scrollContainer.clientHeight
				style.setProperty("--width", editor.scrollContainer.clientWidth + "px")
				style.setProperty("--height", height + "px")
				if (key == " " && code == 2) {
					if (cursor) startQuery(true)
					preventDefault(e)
				} else if (!code && isOpen) {
					if (/^Arrow[UD]/.test(key)) {
						move(key[5] == "U")
						preventDefault(e)
					} else if (/Tab|Enter/.test(key)) {
						insertOption(activeIndex)
						preventDefault(e)
					} else if (key == "Escape") {
						hide()
						preventDefault(e)
					} else if (key.slice(0, 4) == "Page") {
						setRowHeight()
						let top = tooltip.scrollTop
						let height = tooltip.clientHeight
						let newActive: number
						if (key[4] == "U") {
							newActive = Math.ceil(top / rowHeight)
							activeIndex =
								activeIndex == newActive || newActive - 1 == activeIndex
									? Math.ceil(Math.max(0, (top - height) / rowHeight) + 1)
									: newActive
						} else {
							top += height + 1
							newActive = Math.ceil(top / rowHeight - 2)
							activeIndex =
								activeIndex == newActive || newActive + 1 == activeIndex
									? Math.ceil(Math.min(numOptions - 1, (top + height) / rowHeight) - 3)
									: newActive
						}
						scrollActiveIntoView()
						updateActive()
						preventDefault(e)
					}
				}
			},
			true,
		)

		list.onmousedown = e => {
			insertOption([].indexOf.call(rows, (e.target as HTMLElement).closest("li") as never) + offset)
			preventDefault(e)
		}

		list.addEventListener("focusout", e => {
			if (config.closeOnBlur != false && e.relatedTarget != textarea) hide()
		})
	}

export { autoComplete, registerCompletions }
