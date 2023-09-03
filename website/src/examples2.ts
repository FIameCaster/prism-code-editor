export const code = [
	`import { ForwardedRef, forwardRef, useEffect, useRef } from "react"
import { PrismEditor } from "prism-code-editor"
import { fullEditor, SetupOptions, updateTheme } from "prism-code-editor/setups"
import Prism from "prism-code-editor/prism-core"

export const PrismEditorReact = forwardRef((
  props: SetupOptions,
  ref: ForwardedRef<PrismEditor>
) => {
  const divRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<PrismEditor>()

  useEffect(() => {
    editorRef.current?.setOptions(props)
  }, [props])

  useEffect(() => {
    editorRef.current && updateTheme(editorRef.current, props.theme)
  }, [props.theme])

  useEffect(() => {
    const div = divRef.current!
    const editor = editorRef.current = fullEditor(Prism, div, props)
    if (ref) typeof ref == "function" ? ref(editor) : ref.current = editor
    return editor.remove
  }, [])

  return <div className="prism-editor-react" ref={divRef} />
})`,

	`export const App = () => {
  const [code, setCode] = useState("")
  return <PrismEditorReact
    ref={editor => console.log(editor)}
    theme="github-dark"
    language="html"
    value={code}
    onUpdate={setCode}
  />
}`,

	`// extensions.ts
import "prism-code-editor/search.css"
import "prism-code-editor/copy-button.css"
import "prism-code-editor/languages/html"
import "prism-code-editor/languages/clike"
import "prism-code-editor/languages/css"

import { PrismEditor } from "prism-code-editor"
import { searchWidget, highlightSelectionMatches } from "prism-code-editor/search"
import { defaultCommands } from "prism-code-editor/commands"
import { cursorPosition } from "prism-code-editor/cursor"
import { copyButton } from "prism-code-editor/copy-button"
import { matchTags } from "prism-code-editor/match-tags"
import { highlightBracketPairs } from "prism-code-editor/highlight-brackets"

export const addExtensions = (editor: PrismEditor) => {
  editor.addExtensions(
    highlightSelectionMatches(),
    searchWidget(),
    defaultCommands(cursor),
    copyButton(),
    matchTags(),
    highlightBracketPairs(),
    cursorPosition(),
  )
}`,

	`import Prism from "prism-code-editor/prism-core"
import "prismjs/components/prism-markup.js"
import "prismjs/components/prism-css.js"
import "prismjs/components/prism-clike.js"
import "prismjs/components/prism-javascript.js"

import { createEditor } from "prism-code-editor"
import { matchBrackets } from "prism-code-editor/match-brackets"
import { indentGuides } from "prism-code-editor/guides"

// Importing styles
import "prism-code-editor/layout.css"
import "prism-code-editor/scrollbar.css"
import "prism-code-editor/themes/github-dark.css"

const editor = createEditor(
  Prism,
  "#editor",
  { language: "html" },
  indentGuides(),
  matchBrackets(true),
)

import('./extensions').then(module => {
  module.addExtensions(editor)
})`,

	`import {
  addBasicEditor, PrismEditorElement
} from "prism-code-editor/web-component"
import Prism from "prism-code-editor/prism-core"

// Adds a web component with the specified name
addBasicEditor(Prism, "prism-editor")

const editorElement = document.querySelector<PrismEditorElement>("prism-editor")

// Add an event for when the editor finishes loading
editorElement.addEventListener("ready", () => console.log("ready"))

// The editor can be accessed from the element
console.log(editorElement.editor)`,

	`<style>
  prism-editor {
    display: grid;
    height: 30em;
    overflow: hidden;
  }
</style>
<prism-editor
  language="javascript"
  theme="vs-code-dark"
  tab-size="4" word-wrap
  line-numbers insert-spaces
>
  The editors initial code goes here
</prism-editor>`,

	`import Prism from "prism-code-editor/prism-core"
import { createEditor } from "prism-code-editor"
const editor = createEditor(Prism, "#editor", { language: "html" })

// Adding a Ctrl+Enter shortcut while keeping the default enter functionality
const oldEnterCallback = editor.keyCommandMap.Enter

editor.keyCommandMap.Enter = (e, selection, value) => {
  if (e.ctrlKey) {
    // Shortcut code goes here

    // returning true will automatically call e.preventDefault()
    return true
  }
  return oldEnterCallback?.(e, selection, value)
}

// Removing the default backspace command
editor.keyCommandMap.Backspace = null

// Dynamically importing themes inline
import { loadTheme } from "prism-code-editor/themes"

const isDark = matchMedia("(prefers-color-scheme: dark)").matches

loadTheme(isDark ? "github-dark" : "github-light").then(theme => {
  console.log(theme)
})

// Adding custom language behavior
import { langauages } from "prism-code-editor"

languages.whatever = {
  comments: {
    line: "//",
    block: ["/*", "*/"]
  },
  autoIndent: [
    // Whether to indent
    ([start], value) => /[([{][^\\n)\\]}]*$/.test(value.slice(0, start)),
    // Whether to add an extra line
    ([start, end], value) => /\\[]|\\(\\)|{}/.test(value[start - 1] + value[end])
  ]
}`,
	`<!DOCTYPE html>
<html lang="en">
<head>
	<style>
		/* You probably want to give extra space for the fold gutters */
		.prism-editor {
			--number-spacing: 1.5em;
		}
	</style>
</head>
<body>
	<div id="myEditor"></div>
	<script type="module">
		import { readOnlyCodeFolding } from "prism-code-editor/code-folding"
		import { createEditor } from "prism-code-editor"
		import { indentGuides } from "prism-code-editor/guides"
		import { matchBrackets } from "prism-code-editor/match-brackets"
		import { matchTags } from "prism-code-editor/match-tags"
		import "prism-code-editor/code-folding.css"

		/* Not all necessary imports are shown above.

		To fold matching curly/square brackets or XML elements,
		you will need a bracket matcher and a tag matcher respectively.
		Those extensions should be added before the code folding.

		Folding of multiline comments is also supported, but you will
		need to import language specific behavior for it to work. */

		const editor = createEditor(
			Prism,
			"#myEditor",
			{
				language: "html",
				readOnly: true,
				value: "<div>\\n  test\\n</div>"
			},
			indentGuides(),
			matchBrackets(true),
			matchTags(),
			readOnlyCodeFolding()
		)
	</script>
</body>
</html>`,
]
