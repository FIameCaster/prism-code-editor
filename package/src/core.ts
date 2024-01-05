import type {
	EditorOptions,
	PrismEditor,
	KeyCommandCallback,
	Language,
	InputCommandCallback,
	TokenizeEnv,
	EditorEventMap,
	Extension,
	InputSelection,
} from "./types"
import { Prism, languages } from "./prismCore"

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
		handleSelecionChange = true,
		tokens: (Prism.Token | string)[] = [],
		readOnly: boolean

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
						lines[(activeLineNumber = numLines(value, 0, direction == "backward" ? start : end))]

					if (newLine != activeLine) {
						activeLine?.classList.remove("active-line")
						newLine.classList.add("active-line")
						activeLine = newLine
					}
					overlays.classList.toggle("pce-no-selection", start == end)
				},
			]),
		}

	const setOptions = (options: Partial<EditorOptions>) => {
		;({ language, value = "" } = Object.assign(currentOptions, { value }, options))

		const isNewGrammar = grammar != (grammar = languages[language])
		if (!grammar) throw Error(`Language "${language}" has no grammar.`)

		currentExtensions.forEach(extension => extension.update(self, currentOptions))
		scrollContainer.className = `prism-code-editor language-${language}${
			currentOptions.lineNumbers == false ? "" : " show-line-numbers"
		} pce-${currentOptions.wordWrap ? "" : "no"}wrap${currentOptions.rtl ? " pce-rtl" : ""}`

		scrollContainer.style.tabSize = <any>currentOptions.tabSize || 2
		if (isNewGrammar || value != textarea.value) {
			focusRelatedTarget()
			textarea.value = value
			value = textarea.value
			textarea.selectionEnd = 0
			update()
		}
		overlays.classList.toggle("pce-readonly", (readOnly = !!currentOptions.readOnly))
		textarea.inputMode = readOnly ? "none" : ""
		textarea.setAttribute("aria-readonly", <any>readOnly)
	}

	/** Faster than `Prism.Token.stringify` since it doesn't run `wrap` hooks and can be safely split into lines. */
	const highlight = () => {
		let openingTags = "",
			closingTags = "",
			env = <TokenizeEnv>{ language, code: value, grammar }
		Prism.hooks.run("before-tokenize", env)
		tokens = env.tokens = Prism.tokenize(env.code, env.grammar)
		Prism.hooks.run("after-tokenize", env)
		dispatchEvent("tokenize", env)

		const stringifyAll = (tokens: (string | Prism.Token)[]) => {
			let str = "",
				l = tokens.length
			for (let i = 0; i < l; ) str += stringify(tokens[i++])
			return str
		}

		const stringify = (token: Prism.TokenStream | Prism.Token): string => {
			if (token instanceof Prism.Token) {
				let { type, alias, content } = token,
					className = alias ? " " + (typeof alias == "string" ? alias : alias.join(" ")) : "",
					prevOpening = openingTags,
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

			return typeof token != "string"
				? stringifyAll(token)
				: (token = token.replace(/&/g, "&amp;").replace(/</g, "&lt;")).includes("\n") && closingTags
				? token.replace(/\n/g, closingTags + "\n" + openingTags)
				: token
		}
		return stringifyAll(tokens)
	}

	const update = () => {
		const newLines = highlight().split("\n"),
			l = newLines.length
		let start = 0,
			end1 = newLines.length,
			end2 = prevLines.length,
			newHTML = ""
		while (newLines[start] == prevLines[start] && start < end1) ++start
		while (end1 && newLines[--end1] == prevLines[--end2]);

		// This is not needed, but significantly improves performance when only one line changed
		start == end1 && start == end2 && (lines[++start].innerHTML = newLines[start - 1] + "\n")

		for (let i = end2 < start ? end2 : start - 1; i < end1; )
			newHTML += `<div class="pce-line" aria-hidden="true">${newLines[++i]}\n</div>`
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

	// Safari focuses the textarea if you change its selection or value programmatically
	const focusRelatedTarget = () =>
		isWebKit &&
		!focused() &&
		addTextareaListener(
			"focus",
			e => (e.relatedTarget ? (<HTMLElement>e.relatedTarget).focus() : textarea.blur()),
			{ once: true },
		)

	const dispatchEvent = <T extends keyof EditorEventMap>(
		name: T,
		...args: Parameters<EditorEventMap[T]>
	) => {
		// @ts-ignore
		for (const handler of listeners[name] || []) handler.apply(self, args)
		// @ts-ignore
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
			return focused()
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
		setSelection(start, end, direction) {
			focusRelatedTarget()
			textarea.setSelectionRange(start, end ?? start, direction)
			dispatchSelection(true)
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

	addTextareaListener("keydown", e => {
		keyCommandMap[e.key]?.(e, getInputSelection(), value) && preventDefault(e)
	})

	addTextareaListener("beforeinput", e => {
		if (
			readOnly ||
			(e.inputType == "insertText" && inputCommandMap[e.data!]?.(e, getInputSelection(), value))
		)
			preventDefault(e)
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
	...extensions: Extension[]
) => {
	const el = getElement(placeholder)!
	const editor = createEditor(
		undefined,
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
/**
 * Sets whether editors should ignore tab or use it for indentation.
 * Users can always toggle this using Ctrl+M / Ctrl+Shift+M (Mac).
 */
const setIgnoreTab = (newState: boolean) => (ignoreTab = newState)

const preventDefault = (e: Event) => {
	e.preventDefault()
	e.stopImmediatePropagation()
}

const setSelection = (s?: InputSelection) => (selection = s)

let ignoreTab: boolean, selectionChange: null | (() => void), selection: InputSelection | undefined

document.addEventListener("selectionchange", () => selectionChange?.())

export {
	createEditor,
	languageMap,
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
	editorFromPlaceholder,
}
