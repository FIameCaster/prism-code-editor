[![Bundle size](https://img.shields.io/bundlephobia/minzip/prism-code-editor?label=size)](https://bundlephobia.com/package/prism-code-editor)
[![NPM Package](https://img.shields.io/npm/v/prism-code-editor)](https://npmjs.com/prism-code-editor)

# Prism code editor

Lightweight, extensible code editor for the web using [Prism](https://prismjs.com)

## Why

There are multiple fully featured code editors for the web such as Monaco, Ace and Codemirror. While these are awesome, they have a large footprint and are likely overkill for simple interactive code examples or forms where users submit code. Since the library is so lightweight, a read-only editor is an excellent alternative to plain Prism as well.

## Key features

- Lightweight, 2kB gzipped core
- Line numbers
- Optional word wrap
- Line- and block comment toggling
- Search and replace functionality
- Wraps selection in brackets/quotes
- Automatic indentation
- Automatic closing of brackets, quotes and tags
- Indent selected lines with tab key
- Uses the browsers native undo/redo
- Highlights the line with the cursor
- Bracket pairing and rainbow brackets
- Works great on mobile

## Demo and examples

Underneath you can see the editor in action and play around with all the options.

https://prism-code-editor.netlify.app

## Table of contents

- [Installation](#installation)
- [Basic usage](#basic-usage)
- [Advanced usage](#advanced-usage)
- [API](#api)
  - [Return type](#return-type)
    - [Read-only properties](#read-only-properties)
    - [Methods](#methods)
  - [Utilities](#utilities)
- [Extensions](#extensions)
  - [Searching](#searching)
  - [Creating your own](#creating-your-own)
- [Styling](#styling)
  - [Importing themes](#importing-themes)
  - [Scrollbar styling](#scrollbar-styling)
  - [Advanced styling](#advanced-styling)
    - [Conflicting styles](#conflicting-styles)
    - [Creating a theme](#creating-a-theme)
- [Language specific behavior](#language-specific-behavior)
  - [Adding languages](#adding-languages)
- [Editing key commands](#editing-key-commands)
- [Web components](#web-components)
- [Prism plugin support](#demo-and-examples)
- [Performance](#performance)
- [Browser support](#browser-support)
- [Contributing](#contributing)

## Installation

    npm install prism-code-editor

Before you can create any editors, you need to import Prism. To do this you can install Prism from npm or [download](https://prismjs.com/download.html) it.

    npm install prismjs

You can now create an editor.

```javascript
import Prism from "prismjs"
// Importing additional languages from Prism
import "prismjs/components/prism-css-extras.js"
import "prismjs/components/prism-js-extras.js"
import { createEditor } from "prism-code-editor"

const editor = createEditor(Prism, "#editor", { language: "html" })
```

Alternatively, you can import a modified Prism core which is less than half the size due to stripping away all methods except for `Prism.Tokenize` and dropping support for legacy browsers.

```javascript
import Prism from "prism-code-editor/prism-core"
// This core is not bundled with any languages
import "prismjs/components/prism-clike.js"
import "prismjs/components/prism-markup.js"
import "prismjs/components/prism-javascript.js"
import "prismjs/components/prism-css.js"
import { createEditor } from "prism-code-editor"

const editor = createEditor(Prism, "#editor", { language: "html" })
```

If you want to use markdown, you need to import a modified version to highlight code blocks. This modified version is also ~25% smaller.

```javascript
import Prism from "prism-code-editor/prism-core"
import "prism-code-editor/prism-markdown"
```

## Basic usage

The library includes 4 different setups you can import. These will automatically import the necessary styles and scope them with a shadow root, add various extensions and import all language specific behavior. There's also [web components](#web-components) wrapping these setups if that's preferred. These setups are only recommended for getting started due to being harder to customize and extend while risking code duplication.

```javascript
import { minimalEditor, basicEditor, fullEditor, readonlyEditor } from "prism-code-editor/setups"
import Prism from "prism-code-editor/prism-core"

const editor = fullEditor(
	Prism,
	"#editor",
	{
		language: "html",
		theme: "github-dark",
	},
	() => console.log("ready"),
)
```

To avoid layout shifts when the editor loads, you should give the container a fixed height.

## Advanced usage

With little effort, you can fully customize which extensions are added and how they're loaded. This won't use a shadow root which makes the editor much easier to style and customize at the expense of potential style collisions.

To minimize your main javascript bundle, you can dynamically import extensions. This can be made easier by creating a module that exports all extensions you want to dynamically import which is what's done below.

```javascript
// extensions.ts
import "prism-code-editor/search.css"
import "prism-code-editor/copy-button.css"
import "prism-code-editor/languages/html"
import "prism-code-editor/languages/clike"
import "prism-code-editor/languages/css"

export * from "prism-code-editor/search"
export * from "prism-code-editor/commands"
export * from "prism-code-editor/cursor"
export * from "prism-code-editor/copy-button"
```

```javascript
import Prism from "prism-code-editor/prism-core"
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

const editor = createEditor(Prism, "#editor", { language: "html" }, indentGuides(), matchBrackets())

import("./extensions").then(module => {
	const cursor = module.cursorPosition()
	editor.addExtensions(
		module.highlightSelectionMatches(),
		module.searchWidget(),
		module.defaultCommands(cursor),
		module.copyButton(),
		cursor,
	)
})
```

Indent guides and bracket matching can also be dynamically imported, but this isn't recommended since they affect the appearance of the editor. The bracket matcher will also force a rerender of the editor if it's added dynamically.

## API

```typescript
const createEditor = (
	Prism: PrismType,
	container?: ParentNode | string,
	options?: Partial<EditorOptions>,
	...extensions: Extension[]
) => PrismEditor
```

- `container` is the element the editor gets appended to. Can either be an HTML element or a selector. If omitted, you must manually append the `scrollContainer` to the DOM.
- `Prism` is a reference to your Prism instance.
- `options` is the options the editor is created with. If omitted, the editor won't function until you call `setOptions`.
- `extensions` is a rest parameter of extensions that will be added to the editor before its first render.

Below are all the properties you can add to `options` with their default values:

```javascript
const options = {
	language: "text",
	tabSize: 2,
	insertSpaces: true,
	lineNumbers: true,
	readOnly: false,
	wordWrap: false,
	value: "",
	onUpdate: undefined,
	onSelectionChange: undefined,
	onTokenize: undefined,
}
```

### Return type

The `PrismEditor` type includes a bunch of useful read only properties and methods for interacting with the editor.

#### Read-only properties

- `scrollContainer`: Scroll container for the editor.
- `wrapper`: Element wrapping the lines and overlays.
- `overlays`: Element containing the overlays.
- `textarea`: Underlying `<textarea>` in the editor.
- `activeLine`: The line the cursor is currently on.
- `activeLineNumber`: The index of the active line.
- `focused`: Whether or not the `<textarea>` is focused.
- `value`: Text in the `<textarea>`. Equivalent to `textarea.value`.
- `options`: Current options for the editor.
- `inputCommandMap`: Record mapping an input to a function called when that input is typed.
- `keyCommandMap`: Record mapping KeyboardEvent.key to a function called when that key is pressed.
- `removed`: True if the remove method has been called.

Adding IDs and event listeners is supported on all elements. Adding classes is supported on all elements except for the scroll container.

#### Methods

All methods are documented in detail with JSDoc, but here's a list of them:

- `setOptions(options: Partial<Options>): void`
- `update(): void`
- `getSelection(): InputSelection`
- `setSelection(): void`
- `addListener<T extends keyof EditorEventMap>(name: T, handler: EditorEventMap[T]): void`
- `removeListener<T extends keyof EditorEventMap>(name: T, handler: EditorEventMap[T]): void`
- `addExtensions(...extensions: Extension[]): void`
- `remove(): void`

### Utilities

All utilities you can import are documented in detail with JSDoc, but here's a list of them:

- `regexEscape: (str: string) => string`
- `getLineBefore: (text: string, position: number) => string`
- `getLines: (text: string, start: number, end: number) => readonly [string[], number, number]`
- `getClosestToken: (editor: PrismEditor, selector: string, marginLeft?: number, marginRight?: number, position?: number) => HTMLSpanElement | null`
- `getLanguage: (editor: PrismEditor, position?: number) => string`
- `insertText: (editor: PrismEditor, text: string, start?: number | null, end?: number | null, newCursorStart?: number | null, newCursorEnd?: number | null) => void`
- `numLines: (str: string, position?: number) => number`
- `getModifierCode: (e: KeyboardEvent) => number`

## Extensions

Most behavior isn't included by default and must be imported. This is to keep the core small for those who don't need the extra functionality.

```javascript
import Prism from "prism-code-editor/prism-core"
import { createEditor } from "prism-code-editor"
import { matchBrackets } from "prism-code-editor/match-brackets"
import { defaultCommands } from "prism-code-editor/commands"
import { cursorPosition } from "prism-code-editor/cursor"

// Doesn't work with word wrap
import { indentGuides } from "prism-code-editor/guides"

import { searchWidget, highlightSelectionMatches } from "prism-code-editor/search"
import "prism-code-editor/search.css"

// Best used for code examples
import { copyButton } from "prism-code-editor/copy-button"
import "prism-code-editor/copy-button.css"

// These extensions have extra properties
// and methods you might find useful.
const brackets = matchBrackets()
const indents = indentGuides()
const search = searchWidget()
const cursor = cursorPosition()

const editor = createEditor(
	Prism,
	"#editor",
	{ language: "html" },
	brackets,
	indents,
	search,
	defaultCommands(cursor),
	highlightSelectionMatches(),
	copyButton(),
	cursor,
)
```

### Searching

If you're not happy with the default search widget, you can import the API's and create your own widget consuming the API.

```javascript
import { createSearchAPI, createReplaceAPI } from "prism-code-editor/search/api"

const searchAPI = createSearchAPI(editor)
const replaceAPI = createReplaceAPI(editor)
```

### Creating your own

```typescript
import { Extension } from "prism-code-editor"

interface MyExtension extends Extension {}

const myExtension = (): MyExtension => {
	// Add local variables and functions in the closure

	return {
		update(editor, options) {
			// Called when the extension is added to an editor
			// Or when the options change
		},
	}
}
```

You can also write a class with an update method if that's preferred.

## Handling Tab

If you're adding the default commands to your editor, the tab key is used for indentation. If this isn't wanted, you can change the behavior. 

Users can at any time toggle tab capturing with Ctrl+M / Ctrl+Shift+M (Mac).

```javascript
import { setIgnoreTab } from "prism-code-editor"
setIgnoreTab(true)
```

## Styling

### Importing themes

There are currently 12 different themes you can import, one of them being from `prism-code-editor/themes/github-dark.css`.

You can also dynamically import themes into your javascript.

```javascript
import { loadTheme } from "prism-code-editor/themes"

const isDark = matchMedia("(prefers-color-scheme: dark)").matches

loadTheme(isDark ? "github-dark" : "github-light").then(theme => {
	console.log(theme)
})
```

### Scrollbar styling

You can import a stylesheet that will give a custom scrollbar to desktop Chrome and Safari.

```javascript
import "prism-code-editor/scrollbar.css"
```

You can change the color of the scrollbar thumb using the custom property `--editor__bg-scrollbar`. Different alphas will be set based on the state of the scrollbar thumb.

```css
.prism-editor {
	/* Values are: Hue, saturation, lightness */
	--editor__bg-scrollbar: 210, 10%, 40%;
}
```

### Advanced styling

If you're not using any of the setups, the styles aren't scoped using an iframe or shadow DOM, which makes them easy to change. If you want to change color, background, font, lineheight or similar, you can do it on `.prism-editor` with CSS.

Default padding is `0.75em` on all sides. If you want to change it, you can use the custom property `--padding-inline` for left and right. Padding on the top and bottom can changed by changing margin-top/bottom on `.prism-editor-wrapper`.

#### Conflicting styles

If you have conflicting styles, but don't use any of the setups, create your own shadow root to put your editor inside. Then just import the CSS inline and append style elements to your shadow root.

#### Creating a theme

Prism themes will work to style the tokens, but nothing else. Great examples of how to create a theme can be found by looking at the [included themes](https://github.com/FIameCaster/prism-code-editor/tree/main/src/themes). These will show you almost everything you need to make a theme. Below is some additional information.

- `.code-line::before` will match a line number
- `.code-line.active-line` matches the line with the cursor
- `.code-line.match-highlight` matches the line with the active search match
- `.prism-editor::before` is the background of the line numbers
- The variable `--number-spacing` is the spacing to the right of the line numbers which defaults to 0.75em

## Language specific behavior

By default, automatic indentation, toggling comments and automatic closing of tags won't work. You'll need to import the behavior or define it yourself.

```javascript
import "prism-code-editor/languages/clike"
import "prism-code-editor/languages/html"
import "prism-code-editor/languages/css"
```

The clike language will work with many languages including JavaScript, Java, C++, C# and C.

Alternatively, you can import all language behavior at the expense of your bundle size.

```javascript
import "prism-code-editor/languages"
```

It's recommended to dynamically import the language behavior since it's not needed before the page has loaded.

### Adding languages

```javascript
import { languages } from "prism-code-editor"

languages.whatever = {
  comments: {
    line: "//"
    block: ["/*", "*/"]
  },
  autoIndent: [
    // Whether to indent
    ([start], value) => /[([{][^\n)\]}]*$/.test(code.slice(0, start)),
    // Whether to add an extra line
    ([start, end], value) => /\[]|\(\)|{}/.test(code[start - 1] + code[end])
  ],
  autoCloseTags([start, end, direction], value) {
    // Function called when the user types ">".
    // Intended to auto close tags.
    // If a string is returned, it will get inserted
    // behind the cursor after a 100ms delay.
  }
}
```

## Editing key commands

Editing key commands is as simple as mutating the `keyCommandMap` for the editor. If you're adding the default commands to the editor, be sure to mutate the command map after adding that extension.

```javascript
// Adding a Ctrl+Enter shortcut without removing the default enter functionality
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
```

Changing `editor.inputCommandMap` will work the exact same way.

## Web components

The library includes a custom element wrapper for all 4 setups you can import.

```typescript
import { addBasicEditor, PrismEditorElement } from "prism-code-editor/web-component"
import Prism from "prism-code-editor/prism-core"

// Adds a web component with the specified name
addBasicEditor(Prism, "prism-editor")

const editorElement = document.querySelector<PrismEditorElement>("prism-editor")

// Add an event for when the editor finishes loading
editorElement.addEventListener("ready", () => console.log("ready"))

// The editor can be accessed from the element
console.log(editorElement.editor)
```

Attributes include `language`, `theme`, `tab-size`, `line-numbers`, `word-wrap`, `readonly` and `insert-spaces`. These attributes are also writable properties on the element.

```html
<prism-editor
	language="javascript"
	theme="vs-code-dark"
	tab-size="4"
	line-numbers
	insert-spaces
	word-wrap
>
	The editors initial code goes here
</prism-editor>
```

## Prism plugin support

This library only runs the `before-tokenize` and `after-tokenize` hooks. This means pretty much none of the Prism plugins will work, although they wouldn't be very useful if they did. 

Markdown uses a `wrap` hook to highlight code blocks to support the autoloader plugin. Since the autoloader won't work anyway, highlighting code blocks will work just fine with an `after-tokenize` hook which is what the modified markdown you can import uses.

Behavior identical to [Highlight Keywords](https://prismjs.com/plugins/highlight-keywords/) is included.

## Performance

All the code is tokenized each time for simplicity's sake. Even though only lines that change are updated in the DOM, the editor slows down as more code is added, although not as quickly as with zero optimizations.

Once you start approaching 1000 LOC, the editor will noticeably slow down on most hardware. If you need to display that much code, consider a more robust/heavy library.

## Browser support

This has been tested to work in the latest desktop and mobile versions of both Safari, Chrome and Firefox. It should work in slightly older browsers too. Won't work properly in browsers that don't support beforeinput events.

## Credits

This library is made possible thanks to [Prism](https://prismjs.com).

## Contributing

Feature requests, bug reports, optimizations and potentially new themes and extensions are all welcome.

To test your changes during development, start the dev server:

	cd package
	pnpm run dev
