import { PrismEditor } from "../.."

export interface Completion {
	label: string
	boost?: number
}

export interface CompletionResult {
	from: number
	options: Completion[]
}

export type CompletionSource<T extends object = object> = (
	context: CompletionContext & T,
	editor: PrismEditor,
) => CompletionResult | undefined | null

export interface CompletionContext {
	before: string
	lineBefore: string
	pos: number
	language: string
	explicit: boolean
}

export type CompletionDefinition<T extends object> = {
	context?: null,
	sources: CompletionSource[]
} | {
	context(context: CompletionContext, editor: PrismEditor): T
	sources: CompletionSource<T>[]
}

export type AttributeConfig = Record<string, null | string[]>

export type TagConfig = Record<string, AttributeConfig>
