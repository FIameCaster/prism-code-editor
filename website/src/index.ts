import "prism-code-editor/prism/languages/javascript"
import { createEditor, editorFromPlaceholder } from "prism-code-editor"
import "prism-code-editor/layout.css"
import "prism-code-editor/scrollbar.css"
import "./style.css"
import initialTheme from "prism-code-editor/themes/github-dark.css?inline"
import { basicUsage, startOptions } from "./examples1"
import { matchBrackets } from "prism-code-editor/match-brackets"
import { indentGuides } from "prism-code-editor/guides"

const style = document.createElement("style")
const wrapper = document.querySelector<HTMLDivElement>(".editor-wrapper")!
const placeholders = document.querySelectorAll<HTMLDivElement>("main>div")

const editor = createEditor(
	wrapper,
	{
		language: "javascript",
		value: startOptions,
	},
	matchBrackets(),
	indentGuides(),
)

const editors = [
	editorFromPlaceholder(
		placeholders[0],
		{ language: "javascript", value: basicUsage },
		matchBrackets(),
		indentGuides(),
	),
]

style.textContent = initialTheme
document.head.append(style)

import("./dynamic")

export { editor, editors, startOptions, wrapper, style, placeholders }
