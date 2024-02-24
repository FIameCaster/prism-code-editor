import type {
	EditorOptions,
	PrismEditor,
	KeyCommandCallback,
	Language,
	InputCommandCallback,
	EditorEventMap,
	InputSelection,
	EditorExtension,
} from "./types.js"
import { highlightTokens, languages, tokenizeText, Grammar, TokenStream } from "./prism/index.js"
import { addTextareaListener } from "./utils/local.js"

/**
 * Creates a code editor using the specified container and options.
 * @param container Element to append the editor to or a selector.
 * This can also be a `ShadowRoot` or `DocumentFragment` for example.
 * If omitted, you must manually append the `scrollContainer` to the DOM.
 * @param options Options the editor is initialized with.
 * If omitted, the editor won't function until you call `setOptions`.
 * @param extensions Extensions added before the first render. You can still add extensions later.
 * @returns Object to interact with the created editor.
 */
const createEditor = (
	container?: ParentNode | string | null,
	options?: Partial<EditorOptions>,
	...extensions: EditorExtension[]
): PrismEditor => {
	let language: string,
		grammar: Grammar,
		containerEl = getElement(container),
		prevLines: string[] = [],
		activeLine: HTMLDivElement,
		value = "",
		activeLineNumber: number,
		removed = false,
		focused = false,
		handleSelecionChange = true,
		tokens: TokenStream = [],
		readOnly: boolean

	const scrollContainer = <HTMLDivElement>editorTemplate.cloneNode(true),
		wrapper = <HTMLDivElement>scrollContainer.firstChild,
		overlays = <HTMLDivElement>wrapper.firstChild,
		textarea = <HTMLTextAreaElement>overlays.firstChild,
		lines = <HTMLCollectionOf<HTMLDivElement>>wrapper.children,
		currentOptions = <EditorOptions>{ language: "text" },
		currentExtensions = new Set(extensions),
		listeners: {
			[P in keyof EditorEventMap]?: Set<EditorEventMap[P]>
		} = {
			selectionChange: new Set([
				([start, end, direction]) => {
					const newLine =
						lines[(activeLineNumber = numLines(value, 0, direction == "backward" ? start : end))]

					if (newLine != activeLine) {
						activeLine?.classList.remove("active-line")
						newLine.classList.add("active-line")
						activeLine = newLine
					}
					updateClassName()
				},
			]),
		}

	const setOptions = (options: Partial<EditorOptions>) => {
		;({ language, value = "" } = Object.assign(currentOptions, { value }, options))

		const newGrammar = languages[language]
		const isNewGrammar = grammar != newGrammar
		if (!newGrammar) throw Error(`Language '${language}' has no grammar.`)

		grammar = newGrammar
		readOnly = !!currentOptions.readOnly
		scrollContainer.style.tabSize = <any>currentOptions.tabSize || 2
		textarea.inputMode = readOnly ? "none" : ""
		textarea.setAttribute("aria-readonly", <any>readOnly)
		updateClassName()

		updateExtensions()
		if (isNewGrammar || value != textarea.value) {
			focusRelatedTarget()
			textarea.value = value
			value = textarea.value
			textarea.selectionEnd = 0
			update()
		}
	}

	const update = () => {
		tokens = tokenizeText(value, grammar)
		dispatchEvent("tokenize", tokens, language, value)

		let newLines = highlightTokens(tokens).split("\n")
		let l = newLines.length
		let start = 0,
			end1 = l,
			end2 = prevLines.length,
			newHTML = ""
		while (newLines[start] == prevLines[start] && start < end1) ++start
		while (end1 && newLines[--end1] == prevLines[--end2]);

		// This is not needed, but significantly improves performance when only one line changed
		if (start == end1 && start == end2) lines[++start].innerHTML = newLines[start - 1] + "\n"

		let insertStart = end2 < start ? end2 : start - 1
		let i = insertStart

		while (i < end1) newHTML += `<div class="pce-line" aria-hidden="true">${newLines[++i]}\n</div>`
		for (i = end1 < start ? end1 : start - 1; i < end2; i++) lines[start + 1].remove()
		if (newHTML) lines[insertStart + 1].insertAdjacentHTML("afterend", newHTML)
		for (i = insertStart + 1; i < l; ) lines[++i].setAttribute("data-line", <any>i)
		scrollContainer.style.setProperty("--number-width", Math.ceil(Math.log10(l + 1)) + ".001ch")

		dispatchEvent("update", value)
		dispatchSelection(true)
		setTimeout(setTimeout, 0, () => (handleSelecionChange = true))

		prevLines = newLines
		handleSelecionChange = false
	}

	const updateExtensions = (newExtensions?: EditorExtension[]) => {
		;(newExtensions || currentExtensions).forEach(extension => {
			if (typeof extension == "object") {
				extension.update(self, currentOptions)
				if (newExtensions) currentExtensions.add(extension)
			} else {
				extension(self, currentOptions)
				if (!newExtensions) currentExtensions.delete(extension)
			}
		})
	}

	const updateClassName = ([start, end] = getInputSelection()) => {
		scrollContainer.className = `prism-code-editor language-${language}${
			currentOptions.lineNumbers == false ? "" : " show-line-numbers"
		} pce-${currentOptions.wordWrap ? "" : "no"}wrap${currentOptions.rtl ? " pce-rtl" : ""} pce-${
			start == end ? "no" : "has"
		}-selection${focused ? " pce-focus" : ""}${readOnly ? " pce-readonly" : ""}`
	}

	const getInputSelection = () =>
		selection || [textarea.selectionStart, textarea.selectionEnd, textarea.selectionDirection]

	const keyCommandMap: Record<string, KeyCommandCallback | null> = {
		Escape() {
			textarea.blur()
		},
	}

	const inputCommandMap: Record<string, InputCommandCallback | null> = {}

	// Safari focuses the textarea if you change its selection or value programmatically
	const focusRelatedTarget = () =>
		isWebKit &&
		!focused &&
		addTextareaListener(
			self,
			"focus",
			e => {
				let relatedTarget = <HTMLElement>e.relatedTarget
				if (relatedTarget) relatedTarget.focus()
				else textarea.blur()
			},
			{ once: true },
		)

	const dispatchEvent = <T extends keyof EditorEventMap>(
		name: T,
		...args: Parameters<EditorEventMap[T]>
	) => {
		// @ts-expect-error
		for (const handler of listeners[name] || []) handler.apply(self, args)
		// @ts-expect-error
		currentOptions[`on${name[0].toUpperCase()}${name.slice(1)}`]?.apply(self, args)
	}

	const dispatchSelection = (force?: boolean) =>
		(force || handleSelecionChange) && dispatchEvent("selectionChange", getInputSelection(), value)

	const self: PrismEditor = {
		scrollContainer,
		wrapper,
		overlays,
		textarea,
		get activeLine() {
			return activeLine
		},
		get activeLineNumber() {
			return activeLineNumber
		},
		get value() {
			return value
		},
		options: currentOptions,
		get focused() {
			return focused
		},
		get removed() {
			return removed
		},
		get tokens() {
			return tokens
		},
		inputCommandMap,
		keyCommandMap,
		extensions: {},
		setOptions,
		update,
		getSelection: getInputSelection,
		setSelection(start, end = start, direction) {
			focusRelatedTarget()
			textarea.setSelectionRange(start, end, direction)
			dispatchSelection(true)
		},
		addExtensions(...extensions) {
			updateExtensions(extensions)
		},
		addListener<T extends keyof EditorEventMap>(name: T, handler: EditorEventMap[T]) {
			;(listeners[name] ||= new Set<any>()).add(handler)
		},
		removeListener<T extends keyof EditorEventMap>(name: T, handler: EditorEventMap[T]) {
			listeners[name]?.delete(handler)
		},
		remove() {
			scrollContainer.remove()
			removed = true
		},
	}

	addTextareaListener(self, "keydown", e => {
		keyCommandMap[e.key]?.(e, getInputSelection(), value) && preventDefault(e)
	})

	addTextareaListener(self, "beforeinput", e => {
		if (
			readOnly ||
			(e.inputType == "insertText" && inputCommandMap[e.data!]?.(e, getInputSelection(), value))
		)
			preventDefault(e)
	})
	addTextareaListener(self, "input", () => {
		if (value != textarea.value) {
			value = textarea.value
			update()
		}
	})
	addTextareaListener(self, "blur", () => {
		selectionChange = null
		focused = false
		updateClassName()
	})
	addTextareaListener(self, "focus", () => {
		selectionChange = dispatchSelection
		focused = true
		updateClassName()
	})
	// For browsers that support selectionchange on textareas
	addTextareaListener(self, "selectionchange", e => {
		dispatchSelection()
		preventDefault(e)
	})

	containerEl?.append(scrollContainer)
	options && setOptions(options)
	return self
}

/**
 * Almost identical to {@link createEditor}, but instead of appending the editor to your
 * element, the editor replaces it.
 *
 * The `textContent` of the placeholder will be the code in the editor unless `options.value` is defined.
 * @param placeholder Element or selector which will be replaced by the editor.
 * @param options Options the editor is initialized with.
 * @param extensions Extensions added before the first render. You can still add extensions later.
 * @returns Object to interact with the created editor.
 */
const editorFromPlaceholder = (
	placeholder: string | HTMLElement,
	options: Partial<EditorOptions>,
	...extensions: EditorExtension[]
) => {
	const el = getElement(placeholder)!
	const editor = createEditor(
		null,
		Object.assign({ value: el.textContent }, options),
		...extensions,
	)
	el.replaceWith(editor.scrollContainer)
	return editor
}

/** Returns a div with the specified HTML, class and inline style */
const createTemplate = (innerHTML = "", style = "", className = ""): HTMLDivElement =>
	Object.assign(document.createElement("div"), { innerHTML, style, className })

const getElement = <T extends ParentNode>(el?: T | string | null) =>
	typeof el == "string" ? document.querySelector<HTMLElement>(el) : el

const userAgent = navigator.userAgent
const isMac = /Mac|iPhone|iPod|iPad/i.test(navigator.platform)
const isChrome = /Chrome\//.test(userAgent)
const isWebKit = !isChrome && /AppleWebKit\//.test(userAgent)

/**
 * Counts number of lines in the string between `start` and `end`.
 * If start and end are excluded, the whole string is searched.
 */
const numLines = (str: string, start = 0, end = Infinity) => {
	let count = 1
	for (; (start = str.indexOf("\n", start) + 1) && start <= end; count++);
	return count
}

/** Object storing all language specific behavior. */
const languageMap: Record<string, Language> = {}

const editorTemplate = createTemplate(
	'<div class="pce-wrapper"><div class="pce-overlays"><textarea spellcheck="false" autocapitalize="off" autocomplete="off"></textarea></div></div>',
)

const preventDefault = (e: Event) => {
	e.preventDefault()
	e.stopImmediatePropagation()
}

const setSelection = (s?: InputSelection) => (selection = s)

let selectionChange: null | (() => void), selection: InputSelection | undefined

document.addEventListener("selectionchange", () => selectionChange?.())

export {
	createEditor,
	languageMap,
	numLines,
	createTemplate,
	isMac,
	isChrome,
	isWebKit,
	getElement,
	preventDefault,
	setSelection,
	editorFromPlaceholder,
}
