import * as Prism from "prismjs"

export type EditorOptions = {
	/** Language used for syntax highlighting. */
	language: string
	/** Tabsize for the editor. Defaults to `2`. */
	tabSize?: number | undefined
	/** Whether or not the editor should insert spaces for indentation. Defaults to `true`. */
	insertSpaces?: boolean | undefined
	/** Whether or not line numbers should be shown. Defaults to `true`. */
	lineNumbers?: boolean | undefined
	/** Whether or not the editor should be read only. Defaults to `false`. */
	readOnly?: boolean | undefined
	/** Whether or not the editor should have word wrap. Defaults to `false`. */
	wordWrap?: boolean | undefined
	/** Initial code to display in the editor. */
	value?: string | undefined
	/** Function called when the code of the editor changes. */
	onUpdate?: EditorEventMap["update"] | null
	/** Function called when which line is highlighted changes. */
	onActiveChange?: EditorEventMap["activeChange"] | null
	/** Function called when the selection changes in the editor. */
	onSelectionChange?: EditorEventMap["selectionChange"] | null
	/** Function called after the `after-tokenize` Prism hook, but before the tokens are stringified. */
	onTokenize?: EditorEventMap["tokenize"] | null
}

export type Language = {
	comments?: {
		line?: string
		block?: [string, string]
	}
	/**
	 * Callbacks controlling the automatic indentation on new lines.
	 * First function should return whether indentation should be increased.
	 * Second function should return whether to add an extra line after the charet.
	 */
	autoIndent?: [
		((this: PrismEditor, selection: InputSelection, value: string) => boolean)?,
		((this: PrismEditor, selection: InputSelection, value: string) => boolean)?,
	]
	/**
	 * Function called when the user types `>`. Intended to auto close tags.
	 * @returns string which will get inserted behind the cursor after a 100ms delay.
	 */
	autoCloseTags?(this: PrismEditor, selection: InputSelection, value: string): string | undefined
}

export type PrismType = typeof Prism
export type ActiveChangeCallback = (
	this: PrismEditor,
	oldLine: HTMLDivElement,
	newLine: HTMLDivElement,
) => any
/**
 * Function called when a certain key is pressed.
 * If true is returned, `e.preventDefault()` is called automatically.
 */
export type KeyCommandCallback = (
	e: KeyboardEvent,
	selection: InputSelection,
	value: string,
) => void | boolean
/**
 * Function called when a certain input is typed.
 * If true is returned, `e.preventDefault()` is called automatically.
 */
export type InputCommandCallback = (
	e: InputEvent,
	selection: InputSelection,
	value: string,
) => void | boolean
export type InputSelection = readonly [number, number, "forward" | "backward" | "none"]

export interface Extension {
	/** Function called when the extension is added or the options of the editor change. */
	update(editor: PrismEditor, options: EditorOptions): any
}
export type TokenizeEnv = {
	language: string
	code: string
	grammar: Prism.Grammar
	tokens: (string | Prism.Token)[]
}

export type EditorEventMap = {
	update: (this: PrismEditor, value: string) => any
	activeChange: ActiveChangeCallback
	selectionChange: (this: PrismEditor, selection: InputSelection, value: string) => any
	tokenize: (this: PrismEditor, env: TokenizeEnv) => any
}

export interface EventHandler<EventMap extends Record<string, (...args: any) => any>> {
	/** Adds a listener for events with the specified name. */
	addListener<T extends keyof EventMap>(name: T, listener: EventMap[T]): void
	/** Removes a listener for events with the specified name. */
	removeListener<T extends keyof EventMap>(name: T, listener: EventMap[T]): void
}

export interface PrismEditor extends EventHandler<EditorEventMap> {
	/** Scroll container for the editor. */
	readonly scrollContainer: HTMLDivElement
	/** Element wrapping the lines and overlays. */
	readonly wrapper: HTMLDivElement
	/** Element containing the overlays. */
	readonly overlays: HTMLDivElement
	/** Underlying `<textarea>` in the editor. */
	readonly textarea: HTMLTextAreaElement
	/** The line the cursor is currently on. */
	readonly activeLine: HTMLDivElement
	/** The line number of the active line. */
	readonly activeLineNumber: number
	/** Whether or not the `textarea` is focused. */
	readonly focused: boolean
	/** Current code in the editor. Same as `textarea.value`. */
	readonly value: string
	/**
	 * Current options for the editor. The event handlers can be changed by
	 * mutating this object. Use `setOptions` to change the other options.
	 */
	readonly options: EditorOptions
	/** Record mapping an input to a function called when that input is typed. */
	readonly inputCommandMap: Record<string, InputCommandCallback | null | undefined>
	/** Record mapping KeyboardEvent.key to a function called when that key is pressed. */
	readonly keyCommandMap: Record<string, KeyCommandCallback | null | undefined>
	/** True if the remove method has been called. */
	readonly removed: boolean
	/**
	 * Set new options for the editor.
	 * Ommitted properties will use their previous value.
	 * Pass `undefined` to a property to return it to the default value.
	 * @param options New options for the editor
	 */
	setOptions(options: Partial<EditorOptions>): void
	/** Forces an update to the editor. Rarely necessary. */
	update(): void
	/** Gets `selectionStart`, `selectionEnd` and `selectionDirection` for the `textarea`. */
	getSelection(): InputSelection
	/**
	 * Sets the selection for the `textarea`. This will synchronously run the selectionChange
	 * handlers. If that's not wanted, use `textarea.setSelectionRange` instead. Keep in mind
	 * that `textarea.setSelectionRange` will focus the textarea in Safari.
	 * @param start New selectionStart
	 * @param end New SelectionEnd
	 * @param direction New direction
	 */
	setSelection(start: number, end?: number, direction?: "backward" | "forward" | "none"): void
	/** Adds extensions to the editor and calls their update methods. */
	addExtensions(...extensions: Extension[]): void
	/** Removes the editor from the DOM. */
	remove(): void
}
