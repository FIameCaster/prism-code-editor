import type { TokenStream } from "prism-code-editor/prism"
import type { CodeBlockOptions, RenderOptions } from "prism-code-editor/ssr"

export type BlockProps = Record<string, any> & {
	language: string
	value: string
}

export type PcePluginOptions = {
	editorsOnly?: boolean
	defaultEditorProps?: Omit<RenderOptions, "value" | "language">
	defaultCodeBlockProps?: Omit<Partial<CodeBlockOptions>, "value" | "language">
	customRenderer?(
		props: BlockProps,
		defaultRenderer: (props: BlockProps) => string,
		isEditor: boolean,
	): string
	inline?: {
		tokenizeCallback?(tokens: TokenStream): void
	},
	silenceWarnings?: boolean
}
