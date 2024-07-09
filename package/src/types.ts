import { BracketMatcher } from "./extensions/matchBrackets/index.js"
import { TagMatcher } from "./extensions/matchTags.js"
import { Cursor } from "./extensions/cursor.js"
import { SearchWidget } from "./extensions/search/widget.js"
import { IndentGuides } from "./extensions/guides.js"
import { ReadOnlyCodeFolding } from "./extensions/folding/index.js"
import { TokenStream } from "./prism/types.js"
import { EditHistory } from "./extensions/commands.js"

export type EditorOptions = {
	/** Language used for syntax highlighting. @default "text" */
	language: string
	/** Tabsize for the editor. @default 2 */
	tabSize?: number | undefined
	/** Whether the editor should insert spaces for indentation. @default true */
	insertSpaces?: boolean | undefined
	/** Whether line numbers should be shown. @default true */
	lineNumbers?: boolean | undefined
	/** Whether the editor should be read only. @default false */
	readOnly?: boolean | undefined
	/** Whether the editor should have word wrap. @default false */
	wordWrap?: boolean | undefined
	/** Code to display in the editor. */
	value: string
	/** @experimental Whether the editor uses right to left directionality. @default false */
	rtl?: boolean
	/** Function called when the code of the editor changes. */
	onUpdate?: EditorEventMap["update"] | null
	/** Function called when the selection changes in the editor. */
	onSelectionChange?: EditorEventMap["selectionChange"] | null
	/** Function called before the tokens are stringified to HTML. */
	onTokenize?: EditorEventMap["tokenize"] | null
}

export type CommentTokens = {
	line?: string
	block?: [string, string]
}

export type Language = {
	/** Comment tokens used by the language. */
	comments?: CommentTokens
	/**
	 * Method called when a user executes a comment toggling command.
	 * @param editor The editor the user is interacting with.
	 * @param position Where in the code the comment is being toggled.
	 * @param value Current code in the editor.
	 * @returns The comment tokens that should be used for this command.
	 */
	getComments?(editor: PrismEditor, position: number, value: string): CommentTokens
	/**
	 * Callbacks controlling the automatic indentation on new lines.
	 * First function should return whether indentation should be increased.
	 * Second function should return whether to add an extra line after the cursor.
	 */
	autoIndent?: [
		((selection: InputSelection, value: string, editor: PrismEditor) => boolean)?,
		((selection: InputSelection, value: string, editor: PrismEditor) => boolean)?,
	]
	/**
	 * Function called when the user types `>`. Intended to auto close tags.
	 * @returns string which will get inserted behind the cursor.
	 */
	autoCloseTags?(selection: InputSelection, value: string, editor: PrismEditor): string | undefined
}

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
export type InputSelection = [number, number, "forward" | "backward" | "none"]

export interface Extension {
	/** Function called when the extension is added or the options of the editor change. */
	update(editor: PrismEditor, options: EditorOptions): any
}

export interface BasicExtension {
	(editor: PrismEditor, options: EditorOptions): any
}

export type EditorExtension = Extension | BasicExtension

export type EditorEventMap = {
	update(this: PrismEditor, value: string): any
	selectionChange(this: PrismEditor, selection: InputSelection, value: string): any
	tokenize(this: PrismEditor, tokens: TokenStream, language: string, value: string): any
}

export interface EventHandler<EventMap extends Record<string, (...args: any) => any>> {
	/** Adds a listener for events with the specified name. */
	addListener<T extends keyof EventMap>(this: void, name: T, listener: EventMap[T]): void
	/** Removes a listener for events with the specified name. */
	removeListener<T extends keyof EventMap>(this: void, name: T, listener: EventMap[T]): void
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
	readonly tokens: TokenStream
	/** Object storing some of the extensions added to the editor. */
	readonly extensions: {
		matchBrackets?: BracketMatcher
		matchTags?: TagMatcher
		cursor?: Cursor
		searchWidget?: SearchWidget
		indentGuides?: IndentGuides
		codeFold?: ReadOnlyCodeFolding
		history?: EditHistory
	}
	/**
	 * Set new options for the editor. Ommitted properties will use their old value.
	 * @param options New options for the editor
	 */
	setOptions(this: void, options: Partial<EditorOptions>): void
	/** Forces the editor to update. Can be useful after adding a tokenize listener or modifying a grammar. */
	update(this: void): void
	/** Gets `selectionStart`, `selectionEnd` and `selectionDirection` for the `textarea`. */
	getSelection(this: void): InputSelection
	/**
	 * Sets the selection for the `textarea` and synchronously runs the selectionChange listeners.
	 * If you don't want to synchronously run the listeners, use `textarea.setSelectionRange` instead.
	 * @param start New selectionStart.
	 * @param end New selectionEnd. Defaults to `start`.
	 * @param direction New direction.
	 */
	setSelection(this: void, start: number, end?: number, direction?: "backward" | "forward" | "none"): void
	/** Adds extensions to the editor and calls their update methods. */
	addExtensions(this: void, ...extensions: EditorExtension[]): void
	/** Removes the editor from the DOM and marks the editor as removed. */
	remove(this: void): void
}
