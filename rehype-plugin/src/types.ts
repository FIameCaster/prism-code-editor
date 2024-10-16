import type { EditorOptions } from "prism-code-editor"
import type { TokenStream } from "prism-code-editor/prism"
import type { CodeBlockOptions } from "prism-code-editor/ssr"

export type PcePluginOptions = {
	editorsOnly?: boolean
	defaultEditorProps?: Omit<
		Partial<EditorOptions>,
		"onTokenize" | "onSelectionChange" | "onUpdate" | "value" | "language"
	> & {
		tokenizeCallback?(tokens: TokenStream): void
	}
	defaultCodeBlockProps?: Omit<Partial<CodeBlockOptions>, "code" | "language">
	customRenderer?(
		props: Record<string, any>,
		defaultRenderer: (props: Record<string, any>) => string,
	): string
}
