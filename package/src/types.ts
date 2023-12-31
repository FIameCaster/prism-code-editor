import * as Prism from "prismjs"
import { BracketMatcher } from "./extensions/matchBrackets"
import { TagMatcher } from "./extensions/matchTags"
import { Cursor } from "./extensions/cursor"
import { SearchWidget } from "./extensions/search"
import { IndentGuides } from "./extensions/guides"
import { ReadOnlyCodeFolding } from "./extensions/folding"

export type EditorOptions = {
	/** Language used for syntax highlighting. */
	language: string
	/** Tabsize for the editor. Defaults to `2`. */
	tabSize?: number | undefined
	/** Whether the editor should insert spaces for indentation. Defaults to `true`. */
	insertSpaces?: boolean | undefined
	/** Whether line numbers should be shown. Defaults to `true`. */
	lineNumbers?: boolean | undefined
	/** Whether the editor should be read only. Defaults to `false`. */
	readOnly?: boolean | undefined
	/** Whether the editor should have word wrap. Defaults to `false`. */
	wordWrap?: boolean | undefined
	/** Initial code to display in the editor. */
	value: string
	/** @experimental Whether the editor uses right to left directionality. Defaults to `false`. */
	rtl?: boolean
	/** Function called when the code of the editor changes. */
	onUpdate?: EditorEventMap["update"] | null
	/** Function called when the selection changes in the editor. */
	onSelectionChange?: EditorEventMap["selectionChange"] | null
	/** Function called after `after-tokenize` Prism hooks, but before the tokens are stringified. */
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
	 * Second function should return whether to add an extra line after the cursor.
	 */
	autoIndent?: [
		((this: PrismEditor, selection: InputSelection, value: string) => boolean)?,
		((this: PrismEditor, selection: InputSelection, value: string) => boolean)?,
	]
	/**
	 * Function called when the user types `>`. Intended to auto close tags.
	 * @returns string which will get inserted behind the cursor.
	 */
	autoCloseTags?(this: PrismEditor, selection: InputSelection, value: string): string | undefined
}

export type PrismType = Omit<
	typeof Prism,
	"highlight" | "highlightAll" | "highlightAllUnder" | "highlightElement"
>
/**
 * Function called when a certain key is pressed.
 * If true is returned, `e.preventDefault()` and `e.stopImmediatePropagation()` is called automatically.
 */
export type KeyCommandCallback = (
	e: KeyboardEvent,
	selection: InputSelection,
	value: string,
) => void | boolean
/**
 * Function called when a certain input is typed.
 * If true is returned, `e.preventDefault()` and `e.stopImmediatePropagation()` is called automatically.
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
	/** This is the outermost element of the editor. */
	readonly scrollContainer: HTMLDivElement
	/** Element wrapping the lines and overlays. */
	readonly wrapper: HTMLDivElement
	/**
	 * Element containing overlays that are absolutely positioned ontop or behind the code.
	 * It is completely safe to append your own overlays to this element, but they will get
	 * some default styles.
	 */
	readonly overlays: HTMLDivElement
	/** Underlying `<textarea>` in the editor. */
	readonly textarea: HTMLTextAreaElement
	/** The line the cursor is currently on. */
	readonly activeLine: HTMLDivElement
	/** The line number of the active line. */
	readonly activeLineNumber: number
	/** Whether the `textarea` is focused. */
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
	/** Tokens currently displayed in the editor. */
	readonly tokens: (Prism.Token | string)[]
	/** Object storing some of the extensions added to the editor. */
	readonly extensions: {
		matchBrackets?: BracketMatcher
		matchTags?: TagMatcher
		cursor?: Cursor
		searchWidget?: SearchWidget
		indentGuides?: IndentGuides
		codeFold?: ReadOnlyCodeFolding
	}
	/**
	 * Set new options for the editor. Ommitted properties will use their previous value.
	 * @param options New options for the editor
	 */
	setOptions(options: Partial<EditorOptions>): void
	/** Forces the editor to update. Can be useful after adding a tokenize listener or modifying a grammar. */
	update(): void
	/** Gets `selectionStart`, `selectionEnd` and `selectionDirection` for the `textarea`. */
	getSelection(): InputSelection
	/**
	 * Sets the selection for the `textarea` and synchronously runs the selectionChange listeners.
	 * @param start New selectionStart
	 * @param end New selectionEnd
	 * @param direction New direction
	 */
	setSelection(start: number, end?: number, direction?: "backward" | "forward" | "none"): void
	/** Adds extensions to the editor and calls their update methods. */
	addExtensions(...extensions: Extension[]): void
	/** Removes the editor from the DOM and marks the editor as removed. */
	remove(): void
}
