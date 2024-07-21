import { BasicExtension } from "../.."
import { addTextareaListener, createTemplate, preventDefault } from "../../core"
import { addTooltip } from "../../tooltips"
import { getLanguage, getLineBefore, getModifierCode, insertText, prevSelection } from "../../utils"
import { CompletionFilter } from "./filter"
import { Completion, CompletionContext, CompletionDefinition } from "./types"

let count = 0

const template = createTemplate("<div class=pce-ac-tooltip><ul role=listbox>")
const rowTemplate = createTemplate(
	"<li class=pce-ac-row role=option> <span> </span> <div class=pce-ac-details>",
)
const matchTemplate = createTemplate("<span> ")

const map: Record<string, CompletionDefinition<any>> = {}

const register = <T extends object>(langs: string[], definition: CompletionDefinition<T>) => {
	langs.forEach(lang => (map[lang] = definition))
}

const autoComplete =
	(config: { filter: CompletionFilter }): BasicExtension =>
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

		const windowSize = 13
		const textarea = editor.textarea
		const tooltip = template()
		const [show, _hide] = addTooltip(editor, tooltip)
		const list = tooltip.firstChild as HTMLUListElement
		const id = (list.id = "pce-ac-" + count++)
		const rows = list.children as HTMLCollectionOf<HTMLLIElement>
		const add = editor.addListener
		const hide = () => {
			_hide()
			textarea.removeAttribute("aria-haspopup")
			textarea.removeAttribute("aria-activedescendant")
			isOpen = false
		}

		const updateNode = (node: Text, text: string) => {
			if (node.data != text) node.data = text
		}

		const setRowHeight = () => {
			rowHeight = parseFloat(getComputedStyle(rows[0]).height)
		}

		const updateRow = (option: [number, number[], number, Completion], index: number) => {
			const nodes = rows[index].childNodes
			const label = option[3].label
			const matched = option[1]

			let nodeCount = nodes.length - 2
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
			editor.extensions.cursor!.scrollIntoView()
		}

		const startQuery = (explicit = false) => {
			const selection = editor.getSelection()
			const language = getLanguage(editor, (pos = selection[0]))
			const definition = map[language]
			if (definition && editor.extensions.cursor && (explicit || pos == selection[1])) {
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

					for (let i = 0, l = numOptions < windowSize ? numOptions : windowSize; i < l; ) {
						updateRow(currentOptions[i], i++)
					}

					list.style.paddingTop = ""
					list.style.height = rowHeight ? rowHeight * numOptions + "px" : 1.4 * numOptions + "em"
					tooltip.scrollTop = 0

					isOpen = true
					show()
					textarea.setAttribute("aria-haspopup", "listbox")
					activeIndex = offset = 0
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
			for (let i = 0; i < windowSize; i++) {
				updateRow(currentOptions[offset + i], i)
			}

			list.style.paddingTop = offset * rowHeight + "px"
			updateActive()
		}

		add("update", () => {
			isTyping = true
			if (shouldOpen) {
				shouldOpen = false
				queueMicrotask(startQuery)
			} else hide()
		})
		add("selectionChange", () => {
			if (!isTyping) hide()
			else isTyping = false
		})
		addTextareaListener(
			editor,
			"beforeinput",
			e => {
				shouldOpen =
					shouldOpen ||
					(e.inputType == "insertText" && !prevSelection) ||
					(e.inputType == "deleteContentBackward" && isOpen)
			},
			true,
		)
		// addTextareaListener(editor, "blur", hide)
		addTextareaListener(
			editor,
			"keydown",
			e => {
				const key = e.key
				const code = getModifierCode(e)
				const style = tooltip.style
				if (key == " " && code == 2) {
					startQuery(true)
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

				style.setProperty("--width", editor.scrollContainer.clientWidth + "px")
				style.setProperty("--height", editor.scrollContainer.clientHeight + "px")
			},
			true,
		)

		list.onclick = e => {
			insertOption([].indexOf.call(rows, (e.target as HTMLElement).closest("li") as never) + offset)
		}
	}

export { autoComplete, register }
