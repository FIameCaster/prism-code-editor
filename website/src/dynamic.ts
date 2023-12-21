import "prism-code-editor/search.css"
import "prism-code-editor/copy-button.css"
import "prism-code-editor/code-folding.css"
import "prism-code-editor/rtl-layout.css"
import "prism-code-editor/languages"
import "prism-code-editor/grammars/markup"
import "prism-code-editor/grammars/css-extras"
import "./jsLangs.js"
import "prism-code-editor/grammars/markdown"
import "prism-code-editor/grammars/clike"
import "prism-code-editor/grammars/python"
import { copyButton } from "prism-code-editor/copy-button"
import { defaultCommands } from "prism-code-editor/commands"
import {
	highlightSelectionMatches,
	searchWidget,
	highlightCurrentWord,
} from "prism-code-editor/search"
import { cursorPosition } from "prism-code-editor/cursor"
import { markdownFolding, readOnlyCodeFolding } from "prism-code-editor/code-folding"
import { matchTags } from "prism-code-editor/match-tags"
import { highlightBracketPairs } from "prism-code-editor/highlight-brackets"
import { addOverscroll } from "prism-code-editor/tooltips"

import { EditorOptions, PrismEditor, createEditor, editorFromPlaceholder } from "prism-code-editor"
import { getClosestToken } from "prism-code-editor/utils"
import { loadTheme } from "prism-code-editor/themes"
import { editor, editors, placeholders, startOptions, style, wrapper } from "./index"
import { startCode } from "./examples1"
import { matchBrackets } from "prism-code-editor/match-brackets"
import { indentGuides } from "prism-code-editor/guides"
import { code } from "./examples2"

let currentOptions = startOptions
let scrollPos: [number, number] = [0, 0]
let activeEditor = 0
let editor1: PrismEditor

const tabs = wrapper.querySelectorAll(".tab")
const errorEl = <HTMLDivElement>wrapper.querySelector(".error")!
const errorMessage = <HTMLPreElement>errorEl.lastElementChild

const makeEditor = (add: boolean, options?: Partial<EditorOptions>) =>
	createEditor(add ? wrapper : undefined, options, matchBrackets(), indentGuides())

const runBtn = <HTMLButtonElement>document.getElementById("run")

const theme = <HTMLSelectElement>document.getElementById("themes"),
	addExtensions = (editor: PrismEditor) => {
		editor.addExtensions(
			searchWidget(),
			highlightSelectionMatches(),
			matchTags(),
			highlightBracketPairs(),
			defaultCommands(),
			cursorPosition(),
		)
		editor.textarea.setAttribute("aria-label", "Code editor")
	},
	toggleActive = () => {
		if (!editor1) {
			addExtensions(
				(editor1 = makeEditor(true, {
					language: "html",
					value: startCode,
				})),
			)
		}
		for (const tab of tabs) tab.classList.toggle("active")
		const current = (activeEditor ? editor1 : editor).scrollContainer
		const newEditor = (activeEditor ? editor : editor1).scrollContainer
		newEditor.style.display = ""
		newEditor.scrollTo(...scrollPos)
		scrollPos = [current.scrollLeft, current.scrollTop]
		current.style.display = "none"

		if (!activeEditor) {
			runBtn.setAttribute("aria-hidden", "true")
			errorEl.setAttribute("aria-hidden", "true")
		} else runBtn.setAttribute("aria-hidden", <any>(currentOptions == editor.value))
		activeEditor = +!activeEditor
	}

const langs = [
	"tsx",
	"jsx",
	"typescript",
	"typescript",
	"typescript",
	"html",
	"javascript",
	"markdown",
]

const addWordHighlight = (editor: PrismEditor, jsx?: boolean) => {
	let selector =
		".string,.comment,.keyword,.regex" + (jsx ? ",.tag>.tag,.tag>.attr-value,.plain-text" : "")

	editor.addExtensions(
		highlightCurrentWord(start => !getClosestToken(editor, selector, 0, 0, start)),
	)
}

const inputs = ["readOnly", "wordWrap", "lineNumbers"].map(
	id => <HTMLInputElement>document.getElementById(id)!,
)

const observer = new IntersectionObserver(entries =>
	entries.forEach(entry => {
		if (entry.isIntersecting) {
			const target = <HTMLElement>entry.target
			const index = [].indexOf.call(placeholders, <never>target)
			const editor = (editors[index] = editorFromPlaceholder(
				target,
				{
					readOnly: index > 7 || inputs[0].checked,
					wordWrap: inputs[1].checked,
					lineNumbers: inputs[2].checked,
					language: langs[index - 1],
					value: code[index - 1],
				},
				matchBrackets(),
				indentGuides(),
				copyButton(),
			))
			addExtensions(editor)
			if (index < 6 || index == 7) {
				addWordHighlight(editor, index < 3)
			}
			if (index == 8) {
				editor.addExtensions(readOnlyCodeFolding(markdownFolding))
				addOverscroll(editor)
			}
			observer.unobserve(target)
		}
	}),
)

placeholders.forEach((el, i) => i && observer.observe(el))

editor.options.onUpdate = code => runBtn.setAttribute("aria-hidden", <any>(currentOptions == code))

runBtn.onclick = () => {
	currentOptions = editor.value
	runBtn.setAttribute("aria-hidden", "true")
	let options: any
	try {
		options = new Function(currentOptions + ";return options")()
	} catch (error) {
		errorEl.removeAttribute("aria-hidden")
		errorMessage.textContent = <string>error
		return
	}

	let newEditor: PrismEditor
	try {
		// Creating a new editor instead of
		newEditor = makeEditor(false, options)
	} catch (error) {
		errorEl.removeAttribute("aria-hidden")
		errorMessage.textContent = <string>error
		return
	}

	wrapper.append(newEditor.scrollContainer)
	editor1?.remove()
	addExtensions?.((editor1 = newEditor))
	toggleActive()
	newEditor.textarea.focus()
}

inputs.forEach(
	input =>
		(input.onchange = () => {
			let options = {
				[input.id]: input.checked,
			}
			editors.forEach((editor, i) => {
				if (input.id != "readOnly" || i < 8) editor.setOptions(options)
			})
		}),
)
addExtensions(editor)
addExtensions(editors[0])
addWordHighlight(editors[0])
editors[0].addExtensions(copyButton())

theme.oninput = () => {
	loadTheme(theme.value.toLowerCase().replace(/ /g, "-")).then(theme => {
		style.textContent = theme!
	})
}
;(<HTMLDivElement>wrapper.firstElementChild).onclick = e => {
	if ((<HTMLElement>e.target).matches(".tab:not(.active)")) toggleActive()
}
