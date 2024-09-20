import { forEachCodeBlock } from "../client/code-block"
import { highlightTokens, languages, tokenizeText, TokenStream } from "../prism"

export type CodeBlockOptions = {
	/** Language used for syntax highlighting. */
	language: string
	/** Code in the code block. */
	code: string
	/** Number of spaces a tab is equal to. @default 2 */
	tabSize?: number
	/** Whether or not to display line numbers. @default false */
	lineNumbers?: boolean
	/** Line number of the first line. @default 1 */
	lineNumberStart?: number
	/** Whether or not lines can wrap. @default false */
	wordWrap?: boolean
	/**
	 * Whether or not indentation is preserved on wrapped lines. When `true`, tabs are
	 * replaced with spaces since Chrome doesn't render tabs properly with this enabled.
	 * Defaults to `true` when `wordWrap` is enabled.
	 */
	preserveIndent?: boolean
	/**
	 * Whether or not to display indentation guides. Does support `wordWrap` unline the
	 * `indentGuides()` editor extension. Does not work with `rtl`. @default false
	 */
	guideIndents?: boolean
	/**
	 * Whether the code block uses right to left directionality. Requires styles from
	 * `prism-code-editor/rtl-layout.css` to work. @default false
	 */
	rtl?: boolean
	/**
	 * Callback that can be used to modify the tokens before they're stringified to HTML.
	 * Can be used to add rainbow brackets for example.
	 */
	tokenizeCallback?(tokens: TokenStream): void
}

/**
 * Renders a static code block as HTML. Styles from `prism-code-editor/code-block.css`
 * are required in addition to the normal layout.
 * @param options Options controlling how to render the code block. Any extra properties
 * not in {@link CodeBlockOptions} will be stringified as JSON and later parsed by
 * {@link forEachCodeBlock}.
 * @returns String of HTML for the static code block.
 */
const renderCodeBlock = <T extends {}>(
	options: CodeBlockOptions & Omit<T, keyof CodeBlockOptions>,
) => {
	let {
		language,
		code,
		tabSize = 2,
		lineNumbers,
		lineNumberStart = 1,
		wordWrap,
		preserveIndent = wordWrap,
		guideIndents,
		rtl,
		tokenizeCallback,
		...rest
	} = options

	let html = `<pre class="prism-code-editor language-${language}${
		lineNumbers ? " show-line-numbers" : ""
	} pce-${wordWrap ? "" : "no"}wrap${rtl ? " pce-rtl" : ""}${
		preserveIndent ? " pce-preserve" : ""
	}${guideIndents && !rtl ? " pce-guides" : ""}" data-props='${JSON.stringify(rest)
		.replace(/&/g, "&amp;")
		.replace(/'/g, "&#39;")}' `

	let indents = preserveIndent || (guideIndents && !rtl) ? getIndents(code, tabSize) : null
	if (preserveIndent) code = code.replace(/\t/g, " ".repeat(tabSize))
	let tokens = tokenizeText(
		code.includes("\r") ? code.replace(/\r?\n/g, "\n") : code,
		languages[language] || {},
	)
	tokenizeCallback?.(tokens)

	let lines = highlightTokens(tokens).split("\n")
	let l = lines.length
	let i = 0

	html += `style="--tab-size:${tabSize};--number-width:${
		(0 | Math.log10(l + lineNumberStart - 1)) + 1
	}.001ch${
		lineNumbers ? `;counter-reset:line ${lineNumberStart - 1}` : ""
	}"><code class=pce-wrapper><div class=pce-overlays></div>`

	while (i < l) {
		html += `<div class=pce-line${indents?.[i] ? ` style=--indent:${indents[i]}ch` : ""}>${
			lines[i++]
		}\n</div>`
	}

	return html + "</code></pre>"
}

const getIndents = (code: string, tabSize: number) => {
	const lines = code.split("\n")
	const l = lines.length
	const result: number[] = Array(l).fill(0)

	for (let prevIndent = 0, emptyPos = -1, i = 0; i < l; i++) {
		let line = lines[i]
		let l = line.search(/\S/)
		let indent = 0
		if (l < 0) {
			if (emptyPos < 0) emptyPos = i
		} else {
			for (let i = 0; i < l; ) {
				indent += line[i++] == "\t" ? tabSize - (indent % tabSize) : 1
			}
			if (emptyPos + 1) {
				if (indent != prevIndent) prevIndent = Math.min(indent, prevIndent) + 1
				while (emptyPos < i) {
					result[emptyPos++] = prevIndent
				}
			}
			result[i] = prevIndent = indent
			emptyPos = -1
		}
	}
	return result
}

export { renderCodeBlock }
