import Prism from "prism-code-editor/prism-core"
import "prism-code-editor/search.css"
import "prism-code-editor/copy-button.css"
import "prism-code-editor/code-folding.css"
import "prism-code-editor/rtl-layout.css"
import "prism-code-editor/languages"
import "prismjs/components/prism-markup"
import "prismjs/components/prism-css"
import "prismjs/components/prism-css-extras"
import "prismjs/components/prism-typescript"
import "prismjs/components/prism-jsx"
import "prismjs/components/prism-tsx"
import "prism-code-editor/prism-markdown"
import "prismjs/components/prism-python"
import "prismjs/components/prism-clike"
import { copyButton } from "prism-code-editor/copy-button"
import { defaultCommands } from "prism-code-editor/commands"
import { highlightSelectionMatches, searchWidget } from "prism-code-editor/search"
import { cursorPosition } from "prism-code-editor/cursor"
import { readOnlyCodeFolding } from "prism-code-editor/code-folding"
import { matchTags } from "prism-code-editor/match-tags"
import { highlightBracketPairs } from "prism-code-editor/highlight-brackets"
import { addOverscroll } from "prism-code-editor/tooltips"

import {
	EditorOptions,
	PrismEditor,
	createEditor,
	editorFromPlaceholder,
	getModifierCode,
	isMac,
} from "prism-code-editor"
import { loadTheme } from "prism-code-editor/themes"
import { editor, editors, placeholders, startOptions, style, wrapper } from "./index"
import { startCode } from "./examples1"
import { matchBrackets } from "prism-code-editor/match-brackets"
import { indentGuides } from "prism-code-editor/guides"
import { code } from "./examples2"

// @ts-ignore
delete Prism.languages.jsx.style // @ts-ignore
delete Prism.languages.jsx.script // @ts-ignore
delete Prism.languages.tsx.style // @ts-ignore
delete Prism.languages.tsx.script

// @ts-ignore
Prism.languages.markup.tag.addInlined("script", "javascript")

// @ts-ignore
// add attribute support for all DOM events.
// https://developer.mozilla.org/en-US/docs/Web/Events#Standard_events
Prism.languages.markup.tag.addAttribute(
	"on(?:abort|blur|change|click|composition(?:end|start|update)|dblclick|error|focus(?:in|out)?|key(?:down|up)|load|mouse(?:down|enter|leave|move|out|over|up)|reset|resize|scroll|select|slotchange|submit|unload|wheel)",
	"javascript",
)

let currentOptions = startOptions
let scrollPos: [number, number] = [0, 0]
let activeEditor = 0

const tabs = wrapper.querySelectorAll(".tab")
const errorEl = <HTMLDivElement>wrapper.querySelector(".error")!
const errorMessage = <HTMLPreElement>errorEl.lastElementChild

const makeEditor = (container: ParentNode | string, options?: Partial<EditorOptions>) =>
	createEditor(Prism, container, options, matchBrackets(true), indentGuides())

const runBtn = <HTMLButtonElement>document.getElementById("run")

const theme = <HTMLSelectElement>document.getElementById("themes"),
	addWidgets = (editor: PrismEditor) => {
		editor.addExtensions(
			searchWidget(),
			highlightSelectionMatches(),
			matchTags(),
			highlightBracketPairs(),
			defaultCommands(),
			cursorPosition(),
		)
	},
	toggleActive = () => {
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

let editor1 = makeEditor(wrapper, {
	language: "html",
	value: startCode,
})

;["tsx", "jsx", "typescript", "javascript", "typescript", "html", "javascript", "html"].forEach(
	(language, i) => {
		editors.push(editorFromPlaceholder(
			Prism,
			placeholders[i + 1],
			{ language, value: code[i] },
			matchBrackets(true),
			indentGuides(),
		))
	},
)

editor1.scrollContainer.style.display = "none"

editor.options.onUpdate = code => runBtn.setAttribute("aria-hidden", <any>(currentOptions == code))

runBtn.title = isMac ? "(Cmd + Enter)" : "(Ctrl + Enter)"

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
		newEditor = makeEditor(wrapper, options)
	} catch (error) {
		errorEl.removeAttribute("aria-hidden")
		errorMessage.textContent = <string>error
		return
	}

	editor1.remove()
	addWidgets?.((editor1 = newEditor))
	toggleActive()
	newEditor.textarea.focus()
}

for (const prop of ["readOnly", "wordWrap", "lineNumbers"]) {
	document.getElementById(prop.toLowerCase())!.onchange = e => {
		const options = {
			[prop]: (<HTMLInputElement>e.target).checked,
		}
		editors.forEach((editor, i) => {
			if (prop != "readOnly" || i < 8) editor.setOptions(options)
		})
	}
}

for (let e of [editor, editor1, ...editors]) addWidgets(e)
editors.forEach(e => e.addExtensions(copyButton()))
editors[8].addExtensions(readOnlyCodeFolding())
editors[8].setOptions({ readOnly: true })
addOverscroll(editors[8])

const commands = editor.keyCommandMap,
	oldEnter = commands.Enter

commands.Enter = (e, selection, value) => {
	if (getModifierCode(e) == (isMac ? 4 : 2) && value != currentOptions) {
		runBtn.click()
		return true
	} else return oldEnter!(e, selection, value)
}

theme.oninput = () => {
	loadTheme(theme.value.toLowerCase().replace(/ /g, "-")).then(theme => {
		style.textContent = theme!
	})
}
;(<HTMLDivElement>wrapper.firstElementChild).onclick = e => {
	const target = <HTMLElement>e.target
	if (target.matches(".tab:not(.active)")) toggleActive()
}
