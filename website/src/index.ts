import Prism from "prism-code-editor/prism-core"
import "./javascript"
import { EditorOptions, createEditor } from "prism-code-editor"
import { indentGuides } from "prism-code-editor/guides"
import { matchBrackets } from "prism-code-editor/match-brackets"
import "prism-code-editor/layout.css"
import "prism-code-editor/scrollbar.css"
import "./style.css"
import initialTheme from "prism-code-editor/themes/github-dark.css?inline"
import { startOptions, basicUsage } from "./examples1"

const style = document.createElement("style")
const wrapper = document.querySelector<HTMLDivElement>(".editor-wrapper")!
const sections = document.getElementsByTagName("section")

const makeEditor = (container: ParentNode | string, options?: Partial<EditorOptions>) =>
	createEditor(Prism, container, options, indentGuides(), matchBrackets())

const editor = makeEditor(wrapper, {
	language: "javascript",
	value: startOptions,
})

for (const section of sections) {
	section.querySelectorAll("div").forEach(div => div.remove())
}

const editors = [2, 3, 3, 4, 4, 5, 5, 6].map(data =>
	makeEditor(sections[data], { language: "javascript" }),
)

style.textContent = initialTheme
document.head.append(style)

editors[0].setOptions({ value: basicUsage })
editors[2].scrollContainer.style.maxHeight = "22.3rem"
editors[2].scrollContainer.before(sections[3].children[2])
editors[4].scrollContainer.before(sections[4].children[2])
editors[5].scrollContainer.style.maxHeight = "24.3rem"

setTimeout(() => import("./dynamic"))

export { editor, editors, startOptions, wrapper, sections, makeEditor, style }
