import type {
	EditorOptions,
	PrismEditor,
	PrismType,
	KeyCommandCallback,
	Language,
	InputCommandCallback,
	TokenizeEnv,
	EditorEventMap,
	Extension,
	InputSelection,
} from "./types"

/**
 * Creates a code editor using the specified container and options.
 * @param container Element to append the editor to or a selector.
 * If omitted, you must manually append the `scrollContainer` to the DOM.
 * @param Prism Reference to your Prism instance.
 * @param options Options the editor is initialized with.
 * If omitted, the editor won't function until you call `setOptions`.
 * @param extensions Extensions present before the first render. You can still add extensions later.
 * @returns Object to interact with the created editor.
 */
const createEditor = (
	Prism: PrismType,
	container?: ParentNode | string,
	options?: Partial<EditorOptions>,
	...extensions: Extension[]
): PrismEditor => {
	let language: string,
		grammar: Prism.Grammar,
		containerEl = getElement(container),
		prevLines: string[] = [],
		activeLine: HTMLDivElement,
		value = "",
		activeLineNumber: number,
		removed = false,
		handleSelecionChange = true

	const scrollContainer = <HTMLDivElement>editorTemplate.cloneNode(true),
		wrapper = <HTMLDivElement>scrollContainer.firstChild,
		overlays = <HTMLDivElement>wrapper.firstChild,
		textarea = <HTMLTextAreaElement>overlays.firstChild,
		lines = <HTMLCollectionOf<HTMLDivElement>>wrapper.children,
		currentOptions = <EditorOptions>{ language: "text" },
		currentExtensions = new Set(extensions),
		addTextareaListener = addEventListener.bind(textarea),
		closingTag = "</span>",
		listeners: {
			[P in keyof EditorEventMap]?: Set<EditorEventMap[P]>
		} = {
			selectionChange: new Set([
				([start, end, direction]) => {
					const newLine =
						lines[(activeLineNumber = numLines(value, direction == "backward" ? start : end))]

					if (newLine != activeLine) {
						activeLine?.classList.remove("active-line")
						newLine.classList.add("active-line")
						activeLine = newLine
					}
					overlays.classList.toggle("no-selection", start == end)
				},
			]),
		}

	const setOptions = (options: Partial<EditorOptions>) => {
		Object.assign(currentOptions, { value }, options)
		currentExtensions.forEach(extension => extension.update(self, currentOptions))
		;({ language, value } = currentOptions)

		const isNewGrammar = grammar != (grammar = Prism.languages[language])
		if (!grammar) throw Error(`Language "${language}" has no grammar.`)

		scrollContainer.className = `prism-editor language-${language}${
			currentOptions.lineNumbers == false ? "" : " show-line-numbers"
		} ${currentOptions.wordWrap ? "" : "no-"}word-wrap`

		scrollContainer.style.tabSize = <any>currentOptions.tabSize || 2
		if (isNewGrammar || value != textarea.value) {
			// Safari focuses the textarea if you change its selection or value programmatically
			if (isWebKit && !focused())
				addTextareaListener("focus", e => (<HTMLElement>e.relatedTarget)?.focus(), { once: true })
			textarea.value = value
			textarea.selectionEnd = 0
			update()
		}
		overlays.classList.toggle("readonly", (textarea.readOnly = !!currentOptions.readOnly))
	}

	/** Faster than `Prism.Token.stringify` since it doesn't run `wrap` hooks and can be safely split into lines. */
	const highlight = (code: string) => {
		let openingTags = "",
			closingTags = "",
			env = <TokenizeEnv>{ language, code, grammar }
		Prism.hooks.run("before-tokenize", env)
		const tokens = (env.tokens = Prism.tokenize(env.code, env.grammar))
		Prism.hooks.run("after-tokenize", env)
		dispatchEvent("tokenize", env)

		const stringifyAll = (tokens: (string | Prism.Token)[]) => {
			let str = "",
				l = tokens.length
			for (let i = 0; i < l; ) str += stringify(tokens[i++])
			return str
		}

		const stringify = (token: string | Prism.TokenStream | Prism.Token): string => {
			if (token instanceof Prism.Token) {
				let { type, alias, content } = token,
					className = ""

				if (alias) {
					if (Array.isArray(alias))
						for (let i = 0; i < alias.length; ) className += " " + alias[i++]
					else className += " " + alias
				}
				let prevOpening = openingTags,
					prevClosing = closingTags,
					opening = `<span class="token ${
						type + className + (type == "keyword" ? " keyword-" + content : "")
					}">`

				closingTags += closingTag
				openingTags += opening
				let contentStr = stringify(content)
				openingTags = prevOpening
				closingTags = prevClosing
				return opening + contentStr + closingTag
			}

			return Array.isArray(token)
				? stringifyAll(token)
				: (token = token.replace(/&/g, "&amp;").replace(/</g, "&lt;")).includes("\n")
				? token.replace(/\n/g, closingTags + "\n" + openingTags)
				: token
		}
		return stringifyAll(tokens)
	}

	const update = () => {
		const newLines = highlight(value).split("\n"),
			l = newLines.length
		let start = 0,
			end1 = newLines.length,
			end2 = prevLines.length,
			newHTML = ""
		while (newLines[start] == prevLines[start] && start < end1) ++start
		while (end1 && newLines[--end1] == prevLines[--end2]);

		// This is not needed, but significantly improves performance when only one line changed
		start - end1 + start - end2 || (lines[++start].innerHTML = newLines[start - 1] + "\n")

		for (let i = end2 < start ? end2 : start - 1; i < end1; )
			newHTML += `<div class="code-line" aria-hidden="true">${newLines[++i]}\n</div>`
		for (let i = end1 < start ? end1 : start - 1; i < end2; i++) lines[start + 1].remove()
		if (newHTML) lines[start].insertAdjacentHTML("afterend", newHTML)
		for (let i = end1 < start ? end1 + 1 : start; i < l; )
			lines[++i].setAttribute("data-line", <any>i)
		scrollContainer.style.setProperty("--number-width", Math.ceil(Math.log10(l + 1)) + 0.001 + "ch")

		handleSelecionChange = true
		dispatchEvent("update", value)
		dispatchSelection()
		setTimeout(setTimeout, 0, () => (handleSelecionChange = true))

		prevLines = newLines
		handleSelecionChange = false
	}

	const getInputSelection = () =>
		selection || [textarea.selectionStart, textarea.selectionEnd, textarea.selectionDirection]

	const focused = () => selectionChange == dispatchSelection

	const keyCommandMap: Record<string, KeyCommandCallback | null> = {
		Escape() {
			textarea.blur()
		},
	}

	const inputCommandMap: Record<string, InputCommandCallback | null> = {}

	const dispatchEvent = <T extends keyof EditorEventMap>(
		name: T,
		...args: Parameters<EditorEventMap[T]>
	) => {
		// @ts-ignore
		for (const handler of listeners[name] || []) handler.apply(self, args)
		// @ts-ignore
		currentOptions[`on${name[0].toUpperCase()}${name.slice(1)}`]?.apply(self, args)
	}

	const dispatchSelection = () =>
		handleSelecionChange && dispatchEvent("selectionChange", getInputSelection(), value)

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
			return focused()
		},
		get removed() {
			return removed
		},
		inputCommandMap,
		keyCommandMap,
		setOptions,
		update,
		getSelection: getInputSelection,
		setSelection(start, end, direction) {
			textarea.setSelectionRange(start, end ?? start, direction)
			dispatchSelection()
		},
		addExtensions(...extensions) {
			extensions.forEach(extension => {
				if (!currentExtensions.has(extension)) {
					currentExtensions.add(extension)
					extension.update(self, currentOptions)
				}
			})
		},
		addListener<T extends keyof EditorEventMap>(name: T, handler: EditorEventMap[T]) {
			;(listeners[name] || (listeners[name] = <any>new Set())).add(handler)
		},
		removeListener<T extends keyof EditorEventMap>(name: T, handler: EditorEventMap[T]) {
			listeners[name]?.delete(handler)
		},
		remove() {
			scrollContainer.remove()
			removed = true
		},
	}

	addTextareaListener("keydown", e => {
		keyCommandMap[e.key]?.(e, getInputSelection(), value) && preventDefault(e)
	})

	addTextareaListener("beforeinput", e => {
		if (e.inputType == "insertText")
			inputCommandMap[e.data!]?.(e, getInputSelection(), value) && preventDefault(e)
	})
	addTextareaListener("input", () => {
		if (value != textarea.value) {
			value = textarea.value
			update()
		}
	})
	addTextareaListener("blur", () => {
		selectionChange = null
	})
	addTextareaListener("focus", () => {
		selectionChange = dispatchSelection
	})
	// For browsers that support selectionchange on textareas
	addTextareaListener("selectionchange", e => {
		dispatchSelection()
		e.stopPropagation()
	})
	// Hack to fix an obscure fontsize bug on iOS Safari when overflowing horizontally
	if (isWebKit && /Mobile/.test(navigator.userAgent)) {
		scrollContainer.contentEditable = <any>true
		wrapper.contentEditable = <any>false
		scrollContainer.tabIndex = -1
	}

	containerEl?.append(scrollContainer)
	options && setOptions(options)
	return self
}

/** Returns a div with the specified HTML, class and inline style */
const createTemplate = (innerHTML = "", style = "", className = ""): HTMLDivElement =>
	Object.assign(document.createElement("div"), { innerHTML, style, className })

const getElement = (el?: ParentNode | string | null) =>
	typeof el == "string" ? document.querySelector(el) : el

const isMac = /Mac|iPhone|iPod|iPad/i.test(navigator.platform)
const isChrome = /Chrome\//.test(navigator.userAgent)
const isWebKit = !isChrome && /AppleWebKit\//.test(navigator.userAgent)

/**
 * Counts number of lines in the string up to the position.
 * If position is excluded, the whole string is searched.
 */
const numLines = (str: string, position = Infinity) => {
	let count = 1,
		i = -1
	for (; (i = str.indexOf("\n", i + 1)) + 1 && i < position; count++);
	return count
}

/** Object storing all language specific behavior. */
const languages: Record<string, Language> = {}

const editorTemplate = createTemplate(
	'<div class="prism-editor-wrapper"><div class="editor-overlays"><textarea spellcheck="false"autocapitalize="off" autocomplete="off"></textarea></div></div>',
)
/**
 * Sets whether editors should ignore tab or use it for indentation.
 * Users can always toggle this using Ctrl+M / Ctrl+Shift+M (Mac).
 */
const setIgnoreTab = (newState: boolean) => (ignoreTab = newState)

const preventDefault = (e: Event) => e.preventDefault()

const setSelection = (s?: InputSelection) => (selection = s)

let ignoreTab: boolean, selectionChange: null | (() => void), selection: InputSelection | undefined

document.addEventListener("selectionchange", () => selectionChange?.())

export {
	createEditor,
	languages,
	setIgnoreTab,
	ignoreTab,
	numLines,
	createTemplate,
	isMac,
	isChrome,
	isWebKit,
	getElement,
	preventDefault,
	setSelection,
}
