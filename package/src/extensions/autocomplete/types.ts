import { PrismEditor } from "../.."

export interface Completion {
	label: string
	/**
	 * Can be used to adjust how the completion is ranked compared to other options.
	 * A positive number moves it up the list, while a negative one moves it down.
	 */
	boost?: number
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
export type CompletionDefinition<T extends object> = {
	context?: null,
	sources: CompletionSource[]
} | {
	context(context: CompletionContext, editor: PrismEditor): T
	sources: CompletionSource<T>[]
}

export type AttributeConfig = Record<string, null | string[]>

export type TagConfig = Record<string, AttributeConfig>
