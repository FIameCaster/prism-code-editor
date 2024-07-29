import { PrismEditor } from "../../index.js"
import { CompletionFilter } from "./filter.js"

export interface Completion {
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
	 * `prism-code-editor/autocomplete-icons.css` adds 13 icons: `class`, `constant`, `enum`,
	 * `function`, `interface`, `keyword`, `namespace`, `parameter`, `property`, `snippet`,
	 * `unit`, and `variable`. You can define your own icons instead.
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
}

export interface CompletionResult {
	/** The start of the range that's being completed. */
	from: number
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

export type AttributeConfig = Record<string, null | string[]>

export type TagConfig = Record<string, AttributeConfig>
