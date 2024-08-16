import { PrismEditor } from "../../index.js"

export interface Completion {
	/**
	 * Label of the option. The label is displayed in the option and used to filter and sort
	 * options. By default, this is the text inserted when the option is selected.
	 */
	label: string
	/**
	 * Can be used to adjust how the completion is ranked compared to other options.
	 * A positive number moves it up the list, while a negative one moves it down.
	 */
	boost?: number
	/** Optional, short piece of information displayed after the label. */
	detail?: string
	/**
	 * Name of the icon shown before the label. This name is appended to the class
	 * `pce-ac-icon-`, so i.e. `.pce-ac-icon-variable` can be used to style icons with the
	 * name `variable`.
	 *
	 * The icon element also gets it color set to the CSS variable `--pce-ac-icon-` followed
	 * by the icon name. Use these CSS variables to set different colors for different icons.
	 *
	 * `prism-code-editor/autocomplete-icons.css` adds 13 icons from VSCode: `class`,
	 * `constant`, `enum`, `function`, `interface`, `keyword`, `namespace`, `parameter`,
	 * `property`, `snippet`, `unit`, and `variable`. You can import your own icons instead.
	 *
	 * Defaults to `"variable"`
	 */
	icon?:
		| "class"
		| "constant"
		| "enum"
		| "function"
		| "interface"
		| "keyword"
		| "namespace"
		| "parameter"
		| "property"
		| "snippet"
		| "unit"
		| "variable"
		| (string & {})
	/**
	 * Text to insert when the completion is selected. Tabs are replaced with spaces when
	 * `options.insertSpaces` isn't set to `false`. Line feeds are replaced by the
	 * indentation at the current line.
	 *
	 * If omitted, the inserted text defaults to `label`.
	 */
	insert?: string
	/**
	 * Array of ranges. Each even index defines the start of a range. The subsequent index
	 * defines the end of that range. The ranges are relative to the start of the inserted
	 * text. The first range is selected initially.
	 *
	 * If there are multiple ranges, the Tab key can ke used to select the next tab stop.
	 * Once the final tab stop is selected or Escape is pressed, the tab stops disappear.
	 *
	 * The ranges must not overlap.
	 *
	 * If the last range only contains one number, the second defaults to the first.
	 */
	tabStops?: number[]
	/**
	 * If this option is selected and the user types a character present in this string,
	 * then the option is inserted right before the character is typed.
	 */
	commitChars?: string
}

export interface CompletionResult {
	/** The start of the range that's being completed. */
	from: number
	/**
	 * The end of the range that will be replaced when one of the options is selected.
	 * This is not used when sorting or filtering the options. Defaults to `selectionEnd`.
	 */
	to?: number
	/** The completions returned by the source. */
	options: Completion[]
}

export type CompletionSource<T extends object = object> = (
	context: CompletionContext & T,
	editor: PrismEditor,
) => CompletionResult | undefined | null

export interface CompletionContext {
	/** The code before the cursor. */
	before: string
	/** The line before the cursor. */
	lineBefore: string
	/** The cursor position in the document. */
	pos: number
	/** The language at the cursor's position. */
	language: string
	/** True if the completion was started explicitly with Ctrl+Space. False otherwise. */
	explicit: boolean
}

/**
 * Completion definition for a language.
 *
 * The context property can be used to add extra properties to the context
 * passed to the completion sources. This is useful to do certain computations once
 * instead of once for each source.
 */
export type CompletionDefinition<T extends object> =
	| {
			context?: null
			sources: CompletionSource[]
	  }
	| {
			context(context: CompletionContext, editor: PrismEditor): T
			sources: CompletionSource<T>[]
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
 * Function that matches an option against the query. If the option matches the query,
 * the function returns an array containing two entries:
 * 1) The score of the match. A higher score means a better match.
 * 2) An array of matched ranges. Each even index defines the start of a range. The
 * subsequent index defines the end of that range.
 */
export type CompletionFilter = (query: string, option: string) => [number, number[]] | undefined

export type AttributeConfig = Record<string, null | string[]>

export type TagConfig = Record<string, AttributeConfig>
