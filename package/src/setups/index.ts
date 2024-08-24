import { EditorOptions, PrismEditor, createEditor } from "../index.js"
import { doc, getElement } from "../core.js"
import { defaultCommands, editHistory } from "../extensions/commands.js"
import { copyButton } from "../extensions/copyButton/index.js"
import { readOnlyCodeFolding } from "../extensions/folding/index.js"
import { indentGuides } from "../extensions/guides.js"
import { highlightBracketPairs } from "../extensions/matchBrackets/highlight.js"
import { matchBrackets } from "../extensions/matchBrackets/index.js"
import { matchTags } from "../extensions/matchTags.js"
import { highlightSelectionMatches } from "../extensions/search/selection.js"
import { searchWidget } from "../extensions/search/widget.js"
import { loadTheme } from "../themes/index.js"

export type SetupOptions = Partial<EditorOptions> & { theme: string }

const addStyles = (shadow: ShadowRoot, styles: string, id: string) => {
	let style = shadow.getElementById(id)
	if (!style) {
		style = doc!.createElement("style")
		style.id = id
		shadow.append(style)
	}
	style.textContent = styles
}

/**
 * Updates the theme of an editor. The editor needs to be inside a shadow root with a style
 * element for the theme whoose `id` is `"theme"`. This is the case when using the setups.
 * @param editor Editor you want to change the theme of.
 * @param theme Name of the new theme.
 */
const updateTheme = (editor: PrismEditor, theme: string) => {
	const el = editor.container.parentNode
	if (el instanceof ShadowRoot) {
		loadTheme(theme).then(style => {
			if (style) addStyles(el, style, "theme")
		})
	}
}

/**
 * Adds an editor inside a shadow root to the given element and asynchronously loads the styles.
 * @param container Must be an element you can attach a shadow root to
 * @param options Options to create the editor as well as the theme to use.
 * @param readyCallback Function called when the styles are loaded.
 * @returns Object to interact with the editor.
 */
const minimalEditor = (
	container: HTMLElement | string,
	options: SetupOptions,
	readyCallback?: () => any,
) => {
	const el = getElement(container)!
	const shadow = el.shadowRoot || el.attachShadow({ mode: "open" })
	const editor = createEditor()
	const remove = editor.remove
	let removed: boolean

	editor.remove = () => {
		remove()
		removed = true
	}

	Promise.all([import("./styles"), loadTheme(options.theme)]).then(([style, theme]) => {
		if (!removed) {
			addStyles(shadow, style.default, "layout-style")
			addStyles(shadow, theme || "", "theme")
			shadow.append(editor.container)
			editor.setOptions(options)
			readyCallback && readyCallback()
		}
	})

	return editor
}

/**
 * Same as {@link minimalEditor}, but also adds {@link indentGuides}, {@link highlightSelectionMatches},
 * {@link matchBrackets}, {@link highlightBracketPairs}, {@link defaultCommands} and {@link editHistory}
 * extensions and language specific behavior.
 *
 * There's also an extension added that clears the history stack every time the value is
 * changed programmatically.
 */
const basicEditor = (
	container: HTMLElement | string,
	options: SetupOptions,
	readyCallback?: () => any,
) => {
	import("./common").then(mod => {
		editor.addExtensions(...mod.common())
	})

	const editor = minimalEditor(container, options, readyCallback)

	return editor
}

/**
 * Same as {@link basicEditor}, but also adds the {@link searchWidget} and {@link matchTags} extensions.
 * @deprecated Will get merged with {@link basicEditor} in the next major release.
 */
const fullEditor = (
	container: HTMLElement | string,
	options: SetupOptions,
	readyCallback?: () => any,
) => {
	import("./common").then(mod => {
		editor.addExtensions(...mod.common())
	})

	const el = getElement(container)!
	const editor = minimalEditor(el, options, readyCallback)

	import("../extensions/search/search.css?inline").then(module => {
		addStyles(el.shadowRoot!, module.default, "search-style")
	})

	import("./full").then(mod => {
		editor.addExtensions(...mod.full())
	})

	return editor
}

/**
 * Same as {@link minimalEditor}, but also adds the {@link copyButton}, {@link matchBrackets},
 * {@link highlightBracketPairs}, {@link matchTags}, {@link indentGuides}, {@link highlightSelectionMatches}
 * and {@link readOnlyCodeFolding} extensions. No commands are added which makes this setup
 * best used with the `readOnly` option set to true.
 */
const readonlyEditor = (
	container: HTMLElement | string,
	options: SetupOptions,
	readyCallback?: () => any,
) => {
	import("./readonly").then(mod => {
		mod.addExtensions(editor)
		addStyles(el.shadowRoot!, mod.style, "readonly-style")
	})

	const el = getElement(container)!
	const editor = minimalEditor(el, options, readyCallback)

	return editor
}

export { basicEditor, fullEditor, minimalEditor, readonlyEditor, updateTheme }
