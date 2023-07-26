import { EditorOptions, PrismEditor, PrismType, createEditor } from ".."
import { getElement } from "../core"
import { loadTheme } from "../themes"

export type SetupOptions = Partial<EditorOptions> & { theme: string }

const addStyles = (shadow: ShadowRoot, styles: string, id?: string) => {
	const style = document.createElement("style")
	style.textContent = styles
	if (id) style.id = id
	shadow.append(style)
}

/**
 * Updates the theme of an editor.
 * Needs to be inside a shadow root with a style element for the theme whoose id is `theme`.
 * @param editor Editor you want to change the theme of.
 * @param theme Name of the new theme.
 */
const updateTheme = (editor: PrismEditor, theme: string) => {
	const el = editor.scrollContainer.parentNode
	if (el instanceof ShadowRoot) {
		const style = el.getElementById("theme")
		if (style)
			loadTheme(theme).then(theme => {
				theme && (style.textContent = theme)
			})
	}
}

/**
 * Adds an editor inside a shadow root to the given element and asynchronously loads the styles.
 * @param Prism Reference to your Prism instance.
 * @param container Must be an element you can attach a shadow root to
 * @param options Options to create the editor as well as the theme to use.
 * @param readyCallback Function called when the styles are loaded.
 * @returns Object to interact with the editor.
 */
const minimalEditor = (
	Prism: PrismType,
	container: HTMLElement | string,
	options: SetupOptions,
	readyCallback?: () => any,
) => {
	const el = <HTMLElement>getElement(container)
	const shadow = el.shadowRoot || el.attachShadow({ mode: "open" })
	const editor = createEditor(Prism)

	Promise.all([import("./styles.ts"), loadTheme(options.theme)]).then(([style, theme]) => {
		if (!editor.removed) {
			addStyles(shadow, style.default)
			addStyles(shadow, theme || "", "theme")
			editor.setOptions(options)
			shadow.append(editor.scrollContainer)
			readyCallback?.()
		}
	})

	return editor
}

/**
 * Same as the `minimalEditor` function, but also adds indentation
 * guides, selection match highlighting, bracket matching,
 * commands and language specific behvaior.
 */
const basicEditor = (
	Prism: PrismType,
	container: HTMLElement | string,
	options: SetupOptions,
	readyCallback?: () => any,
) => {
	import("./common").then(mod => {
		const cursor = mod.cursorPosition()
		editor.addExtensions(
			cursor,
			mod.defaultCommands(cursor),
			mod.matchBrackets(),
			mod.indentGuides(),
		)
	})

	const editor = minimalEditor(Prism, container, options, readyCallback)

	import("../extensions/search/selection.ts").then(mod => {
		editor.addExtensions(mod.highlightSelectionMatches())
	})

	return editor
}

/** Same as the `basicEditor` function, but also adds the search widget. */
const fullEditor = (
	Prism: PrismType,
	container: HTMLElement | string,
	options: SetupOptions,
	readyCallback?: () => any,
) => {
	import("./common").then(mod => {
		const cursor = mod.cursorPosition()
		editor.addExtensions(
			cursor,
			mod.defaultCommands(cursor),
			mod.matchBrackets(),
			mod.indentGuides(),
		)
	})

	const el = <HTMLElement>getElement(container)
	const editor = minimalEditor(Prism, el, options, readyCallback)

	import("../extensions/search/search.css?inline").then(module => {
		editor.removed || addStyles(el.shadowRoot!, module.default)
	})

	import("../extensions/search/index.ts").then(mod => {
		editor.addExtensions(mod.highlightSelectionMatches(), mod.searchWidget())
	})

	return editor
}

/**
 * Same as `minimalEditor`, but also a copy button, bracket matching and
 * indentation guides. No commands are added which makes this setup best
 * used with the `readOnly` option set to true.
 */
const readonlyEditor = (
	Prism: PrismType,
	container: HTMLElement | string,
	options: SetupOptions,
	readyCallback?: () => any,
) => {
	import("./readonly").then(mod => {
		editor.addExtensions(mod.copyButton(), mod.matchBrackets(), mod.indentGuides())
		editor.removed || addStyles(el.shadowRoot!, mod.style)
	})

	const el = <HTMLElement>getElement(container)
	const editor = minimalEditor(Prism, el, options, readyCallback)

	return editor
}

export { basicEditor, fullEditor, minimalEditor, readonlyEditor, updateTheme }
