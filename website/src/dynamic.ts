import "prism-code-editor/search.css"
import "prism-code-editor/copy-button.css"
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
import { code } from "./examples2"
import { PrismEditor, getModifierCode, isMac } from "prism-code-editor"
import { loadTheme } from "prism-code-editor/themes"
import { editor, editors, makeEditor, sections, startOptions, style, wrapper } from "./index"
import { startCode } from "./examples1"

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
	/on(?:abort|blur|change|click|composition(?:end|start|update)|dblclick|error|focus(?:in|out)?|key(?:down|up)|load|mouse(?:down|enter|leave|move|out|over|up)|reset|resize|scroll|select|slotchange|submit|unload|wheel)/
		.source,
	"javascript",
)

let currentOptions = startOptions
let scrollPos: [number, number] = [0, 0]
let activeEditor = 0

const tabs = wrapper.querySelectorAll(".tab")
const errorEl = <HTMLDivElement>wrapper.querySelector(".error")!
const errorMessage = <HTMLPreElement>errorEl.lastElementChild

const langs = ["tsx", "jsx", "typescript", "html", "javascript", "typescript", "typescript"]

const runBtn = <HTMLButtonElement>document.getElementById("run")

const theme = <HTMLSelectElement>document.getElementById("themes"),
	addWidgets = (editor: PrismEditor) => {
		const cursor = cursorPosition()
		editor.addExtensions(
			searchWidget(),
			highlightSelectionMatches(),
			defaultCommands(cursor),
			cursor,
		)
	},
	toggleActive = () => {
		for (const tab of tabs) tab.classList.toggle("active")
		const current = (activeEditor ? editor1 : editor).scrollContainer
		const newEditor = (activeEditor ? editor : editor1).scrollContainer
		newEditor.style.removeProperty("display")
		newEditor.scrollTo(...scrollPos)
		scrollPos = [current.scrollLeft, current.scrollTop]
		current.style.display = "none"

		if (!activeEditor) {
			runBtn.setAttribute("aria-hidden", "true")
			errorEl.setAttribute("aria-hidden", "true")
		}
		// @ts-ignore
		else runBtn.setAttribute("aria-hidden", currentOptions == editor.value)
		activeEditor = +!activeEditor
	}

const commands = editor.keyCommandMap,
	oldEnter = commands.Enter

const observer = new IntersectionObserver(
	e =>
		e.forEach(entry => {
			if (!entry.isIntersecting) return

			const index = editors.findIndex(e => e.scrollContainer == entry.target)
			observer.unobserve(entry.target)
			editors[index].setOptions({ value: code[index - 1], language: langs[index - 1] })
		}),
	{
		rootMargin: "9999px 0px 500px 0px",
	},
)

let editor1 = makeEditor(wrapper, {
	language: "html",
	value: startCode,
})

editor1.scrollContainer.style.display = "none"

editor.options.onUpdate = (
	code, // @ts-ignore
) => runBtn.setAttribute("aria-hidden", currentOptions == code)

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
	editor1 = newEditor
	addWidgets?.(editor1)
	toggleActive()
	newEditor.textarea.focus()
}

for (const prop of ["readOnly", "wordWrap", "lineNumbers"]) {
	document.getElementById(prop.toLowerCase())!.onchange = e => {
		const options = {
			[prop]: (<HTMLInputElement>e.target).checked,
		}
		editors.forEach(editor => editor.setOptions(options))
	}
}

for (let i = 3; i < 7; i++) {
	sections[i].querySelectorAll(".prism-editor").forEach(el => observer.observe(el))
}

for (let e of [editor, editor1, ...editors]) addWidgets(e)
editors.forEach(e => e.addExtensions(copyButton()))

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
