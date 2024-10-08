# Solid prism editor

Code editor component for SolidJS apps

[![Bundle size](https://img.shields.io/bundlephobia/minzip/solid-prism-editor?label=size)](https://bundlephobia.com/package/solid-prism-editor)
[![NPM Package](https://img.shields.io/npm/v/solid-prism-editor)](https://npmjs.com/solid-prism-editor)

## What?

This is a rewrite of [Prism code editor](https://github.com/FIameCaster/prism-code-editor) using Solid's signals. It's a lightweight, extensible code editor optimized for fast load times with many optional extensions.

## Why?

I realized Prism code editor's architecture made a rewrite in SolidJS not only possible, but easy. The result is a component that behaves very similarly, while being easier to use inside SolidJS apps. If a full blown editor like CodeMirror or Monaco is overkill, this might just be the right fit.

## Contents

- [Installation](#installation)
- [Demo](#demo)
- [Examples](#examples)
- [Basic usage](#basic-usage)
- [Props](#props)
- [Extensions](#extensions)
  - [Creating your own](#creating-your-own)
- [Editor API](#editor-api)
  - [Properties](#properties)
    - [DOM Elements](#dom-elements)
  - [Methods](#methods)
  - [Signals](#signals)
  - [Extensions property](#extensions-property)
- [Prism](#prism)
- [Languages](#languages)
- [Styling](#styling)
  - [Themes](#themes)
- [Performance](#performance)
- [Contributing](#contributing)

## Installation

    npm i solid-prism-editor

There's a peer dependency on `solid-js` (obviously).

## Demo

[Prism code editor's demo](https://prism-code-editor.netlify.app). There's no demo for this SolidJS rewrite since its behavior is nearly identical.

## Examples

- [Usage with SolidStart](https://stackblitz.com/edit/github-pjpawa?file=src%2Fcomponents%2FEditor.tsx,src%2Froutes%2Findex.tsx)
- [Usage in forms](https://stackblitz.com/edit/solidjs-templates-mg678j?file=src%2FApp.tsx)
- [Tooltip example](https://stackblitz.com/edit/solidjs-templates-jt7dk5?file=src%2FApp.tsx)
- [Relative line numbers](https://stackblitz.com/edit/solidjs-templates-zpkbwb?file=src%2FApp.tsx)
- [Custom cursor](https://stackblitz.com/edit/solidjs-templates-phg5gs?file=src%2FApp.tsx)

## Basic usage

```jsx
import { Editor } from "solid-prism-editor"
import { basicSetup } from "solid-prism-editor/setups"

// Adding the JSX grammar
import "solid-prism-editor/prism/languages/jsx"

// Adds comment toggling and auto-indenting for JSX
import "solid-prism-editor/languages/jsx"

import "solid-prism-editor/layout.css"
import "solid-prism-editor/themes/github-dark.css"

// Required by the basic setup
import "solid-prism-editor/search.css"

const MyEditor = () => (
  <Editor language="jsx" value="const foo = 'bar'" extensions={basicSetup} />
)
```

## Props

| Name                | Type                                                                      | Description                                                                                                                                     |
| ------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `language`          | `string`                                                                  | Language used for syntax highlighting. Defaults to `text`.                                                                                      |
| `tabSize`           | `number`                                                                  | Tab size used for indentation. Defaults to `2`.                                                                                                 |
| `insertSpaces`      | `boolean`                                                                 | Whether the editor should insert spaces for indentation. Defaults to `true`. Requires the `defaultCommands()` extension to work.                |
| `lineNumbers`       | `boolean`                                                                 | Whether line numbers should be shown. Defaults to `true`.                                                                                       |
| `readOnly`          | `boolean`                                                                 | Whether the editor should be read only. Defaults to `false`.                                                                                    |
| `wordWrap`          | `boolean`                                                                 | Whether the editor should have word wrap. Defaults to `false`.                                                                                  |
| `value`             | `string`                                                                  | Initial value to display in the editor.                                                                                                         |
| `rtl`               | `boolean`                                                                 | Whether the editor uses right to left directionality. Defaults to `false`. Requires extra CSS from `solid-prism-editor/rtl-layout.css` to work. |
| `style`             | `Omit<JSX.CSSProperties, "tab-size">`                                     | Inline styles for the container element                                                                                                         |
| `onMount`           | `(editor: PrismEditor) => void`                                           | Callback used to access the underlying editor.                                                                                                  |
| `onUpdate`          | `(value: string, editor: PrismEditor) => void`                            | Function called after the editor updates.                                                                                                       |
| `onSelectionChange` | `(selection: InputSelection, value: string, editor: PrismEditor) => void` | Function called when the editor's selection changes.                                                                                            |
| `extensions`        | `Extension[]`                                                             | List of extensions added to the editor. More on extensions later.                                                                               |

## Extensions

To keep the core light, most functionality is added by optional extensions.

There are extensions adding:

- Many common commands
- Bracket matching and rainbow brackets
- Tag matching
- Indentation guides
- Search, regex search and replace
- Selection match highlighting
- A copy button
- Read-only code folding
- Custom undo/redo
- And more...

Many commonly used extensions are added by `basicSetup`, but if you want to fully customize which extensions are added. Below it's shown how to import most extensions.

```jsx
import { Editor } from "solid-prism-editor"
import "solid-prism-editor/prism/languages/jsx"
import "solid-prism-editor/layout.css"
// Needed for searchWidget()
import "solid-prism-editor/search.css"
// Needed for copyButton()
import "solid-prism-editor/copy-button.css"

import { matchBrackets } from "solid-prism-editor/match-brackets"
import { highlightBracketPairs } from "solid-prism-editor/highlight-brackets"
import { indentGuides } from "solid-prism-editor/guides"
import { highlightSelectionMatches, searchWidget } from "solid-prism-editor/search"
import { highlightMatchingTags, matchTags } from "solid-prism-editor/match-tags"
import { cursorPosition } from "solid-prism-editor/cursor"
import { defaultCommands, editHistory } from "solid-prism-editor/commands"
import { copyButton } from "solid-prism-editor/copy-button"
import { overscroll } from "solid-prism-editor/overscroll"

const MyEditor = () => {
  return (
    <Editor
      language="jsx"
      value="const foo = 'bar'"
      extensions={[
        matchBrackets(),
        searchWidget(),
        indentGuides(),
        highlightBracketPairs(),
        highlightSelectionMatches(),
        matchTags(),
        highlightMatchingTags(),
        cursorPosition(),
        defaultCommands(),
        editHistory(),
        copyButton(),
        overscroll(),
      ]}
    />
  )
}
```

If you make the extensions a signal, you can freely change which extensions are added to the editor. This makes it possible to asynchronously load most of the extensions to make your main JS bundle smaller. You can also remove extensions which currently isn't possible in Prism code editor.

```jsx
import { createSignal } from "solid-js"
import { Editor } from "solid-prism-editor"
import { matchBrackets } from "solid-prism-editor/match-brackets"
import { indentGuides } from "solid-prism-editor/guides"
import { overscroll } from "solid-prism-editor/overscroll"

import "solid-prism-editor/prism/languages/jsx"
import "solid-prism-editor/layout.css"

const MyEditor = () => {
  const [extensions, setExtensions] = createSignal([matchBrackets(), indentGuides(), overscroll()])

  import("./extensions").then(mod => {
    setExtensions(e => e.concat(mod.extensions()))
  })

  return <Editor language="jsx" value="const foo = 'bar'" extensions={extensions()} />
}
```

```js
// extensions.ts
import { highlightBracketPairs } from "solid-prism-editor/highlight-brackets"
import { highlightSelectionMatches, searchWidget } from "solid-prism-editor/search"
import { highlightMatchingTags, matchTags } from "solid-prism-editor/match-tags"
import { cursorPosition } from "solid-prism-editor/cursor"
import { defaultCommands, editHistory } from "solid-prism-editor/commands"
import { copyButton } from "solid-prism-editor/copy-button"

import "solid-prism-editor/search.css"
import "solid-prism-editor/copy-button.css"

export const extensions = () => [
  searchWidget(),
  highlightBracketPairs(),
  highlightSelectionMatches(),
  matchTags(),
  highlightMatchingTags(),
  cursorPosition(),
  defaultCommands(),
  editHistory(),
  copyButton(),
]
```

### Creating your own

If you need to do anything more than adding a simple `onUpdate` or `onSelectionChange` callback, you should consider creating your own extension.

```tsx
import { createEffect } from "solid-js"
import type { Extension } from "solid-prism-editor"

export const myExtension: Extension = (editor: PrismEditor) => {
  // Selection, tokens, focused and props on the editor are all reactive.
  createEffect(() => {
    console.log("New selection: ", editor.selection())
  })

  createEffect(() => {
    console.log("New tokens: ", editor.tokens())
  })

  createEffect(() => {
    console.log("New focus state: ", editor.focused())
  })

  createEffect(() => {
    console.log("New tab size: ", editor.props.tabSize || 2)
  })

  // The elements returned are added to the editor's overlays
  // Keep in mind that they will get some default styles
  return <div>My overlay</div>
}
```

## Editor API

The editor object you can access with the `onMount` prop or by creating an extension has many useful properties and methods.

### Properties

- `value: string`: Current value of the editor.
- `activeLine: number`: Line number of the line with the cursor. You can index into `editor.lines` to get the DOM node for the active line.
- `inputCommandMap: Record<string, InputCommandCallback | null | undefined>`: Record mapping an input to a function called when that input is typed.
- `keyCommandMap: Record<string, KeyCommandCallback | null | undefined>`: Record mapping KeyboardEvent.key to a function called when that key is pressed.
- `extensions: Object`: Object storing some of the extensions added to the editor. [Read more](#extensions-property).
- `props: EditorProps`: The component props passed to the editor. They are reactive like all props in SolidJS.

#### DOM Elements

- `container: HTMLDivElement`: This is the outermost element of the editor.
- `wrapper: HTMLDivElement`: Element wrapping the lines and overlays.
- `lines: HTMLCollectionOf<HTMLDivElement>`: Collection containing the overlays as the first element, followed by all code lines.
- `textarea: HTMLTextAreaElement`: Underlying `textarea` in the editor.

### Methods

- `update(): void`: Forces the editor to update. Can be useful after modifying a grammar for example.
- `getSelection(): InputSelection`: Gets the `selectionStart`, `selectionEnd` and `selectionDirection` for the `textarea`.
- `setSelection(start: number, end?: number, direction?: "backward" | "forward" | "none"): void`: Sets the selection for the `textarea` and synchronously updates the `selection` signal.

### Signals

- `focused(): boolean`: Reactive accessor for whether the `textarea` is focused. Effects depending on this property will run during `focus` or `blur` events on the `textarea`.
- `tokens(): TokenStream`: Reactive accessor for the current tokens. [Computations](https://docs.solidjs.com/reference/secondary-primitives/create-computed) depending on this property will run right before the tokens are converted to an HTML string.
- `selection(): InputSelection`: Reactive accessor for the current selection. Effects depending on this property will run after the syntax highlighting is finished or when the selection changes.

### Extensions property

Multiple extensions have an entry on `editor.extensions` allowing you to interact with the extension.

- `matchBrackets: BracketMatcher`: Allows access to all brackets found in the editor along with which are paired together.
- `matchTags: TagMatcher`: Allows access to all tags found in the editor along with which tags are paired together.
- `cursor: Cursor`: Allows you to get the cursor position relative to the editor's overlays and to scroll the cursor into view.
- `searchWidget: SearchWidget`: Allows you to open or close the search widget.
- `history: EditHistory`: Allows you to clear the history or navigate it.
- `folding: ReadOnlyCodeFolding`: Allows access to the full unfolded code and to toggle folded ranges.

## Prism

The Prism instance used by this library is exported from `solid-prism-editor/prism`. This allows you to add your own Prism grammars or perform syntax highlighting outside of an editor. All modules under `solid-prism-editor/prism` can run outside the browser in for example Node.js to do syntax highlighting on the server. [API docs](https://prism-code-editor.netlify.app/api/modules/prism).

## Languages

Prism supports syntax highlighting for hundreds of languages, but none of them are imported by default. You need to choose which languages to import. Importing `solid-prism-editor/prism/languages/javascript` for example will register the JavaScript grammar through side effects.

If you need access to many languages, you can import the following entry points:

- `solid-prism-editor/prism/languages` for all languages (~180kB)
- `solid-prism-editor/prism/languages/common` for [42 common languages](https://github.com/FIameCaster/prism-code-editor/tree/main/package/src/prism/languages/common.js) (~30kB)

This library also supports auto-indenting, comment toggling and self-closing tags for most of these languages. For it to work, you need the `defaultCommands()` extension and to import the behavior for the language.

The easiest way is to import all languages at ~3.6kB gzipped. You can dynamically import this since it's usually not needed before the page has loaded.

```javascript
import("solid-prism-editor/languages")
```

You can also import `solid-prism-editor/languages/common` instead to support a subset of common languages at less than 2kB gzipped.

Lastly, if you only need support for a few languages, you can do individual imports, for example `solid-prism-editor/languages/html`. [Read more](https://github.com/FIameCaster/prism-code-editor?tab=readme-ov-file#individual-imports).

## Styling

This library does not inject any CSS into the webpage, instead you must import them. If the default styles don't work for you, you can import your own styles instead.

- `solid-prism-editor/layout.css` is the layout for the editor.
- `solid-prism-editor/scrollbar.css` adds a custom scrollbar to desktop Chrome and Safari you can color with `--editor__bg-scrollbar`.
- `solid-prism-editor/copy-button.css` adds styling for the `copyButton()` extension.
- `solid-prism-editor/search.css` adds styling for the `searchWidget()` extension.
- `solid-prism-editor/rtl-layout.css` adds support for the `rtl` prop.

By default, the editor's height will fit the content, so you might want to add a `height` or `max-height` to `.prism-code-editor` depending on your use case.

### Themes

here are currently 13 different themes you can import, one of them being from `solid-prism-editor/themes/github-dark.css`.

You can also dynamically import themes into your JavaScript.

```javascript
import { loadTheme } from "solid-prism-editor/themes"

const isDark = matchMedia("(prefers-color-scheme: dark)").matches

loadTheme(isDark ? "github-dark" : "github-light").then(theme => {
  console.log(theme)
})
```

If none of the themes fit your website, use one of them as an example to help implement your own.

## Performance

Manual DOM manipulation has been kept is almost every case. This rewrite therefore has very similar performance to the original.

## Contributing

Contributions are welcome. To test your changes during development, run `pnpm dev` or `npm run dev` to run the test site.
