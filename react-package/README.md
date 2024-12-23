# Prism react editor

Code editor component for React apps

[![Bundle size](https://img.shields.io/bundlephobia/minzip/prism-react-editor?label=size)](https://bundlephobia.com/package/prism-react-editor)
[![NPM Package](https://img.shields.io/npm/v/prism-react-editor)](https://npmjs.com/prism-react-editor)

## What?

This is a rewrite of [Prism code editor](https://github.com/FIameCaster/prism-code-editor) using React and hooks. It's a lightweight, extensible code editor optimized for fast load times with many optional extensions.

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
  - [Extensions property](#extensions-property)
- [Languages](#languages)
- [Styling](#styling)
  - [Themes](#themes)
- [Performance](#performance)
- [Contributing](#contributing)

## Installation

    npm i prism-react-editor

You must already have `react` and `react-dom` version 16.8.0 or greater installed.

## Demo

[Prism code editor's demo](https://prism-code-editor.netlify.app). There's no demo for this React rewrite since its behavior is nearly identical.

## Examples

Work in progress.

## Basic usage

Below is an example of a simple JSX editor.

```jsx
import { Editor } from "prism-react-editor"
import { BasicSetup } from "prism-react-editor/setups"

// Adding the JSX grammar
import "prism-react-editor/prism/languages/jsx"

// Adds comment toggling and auto-indenting for JSX
import "prism-react-editor/languages/jsx"

import "prism-react-editor/layout.css"
import "prism-react-editor/themes/github-dark.css"

// Required by the basic setup
import "prism-react-editor/search.css"

function MyEditor() {
  return <Editor language="jsx" value="const foo = 'bar'">
    {editor => <BasicSetup editor={editor} />}
  </Editor>
}
```

## Props

| Name                | Type                                                                                  | Description                                                                                                                                     |
| ------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `language`          | `string`                                                                              | Language used for syntax highlighting. Defaults to `text`.                                                                                      |
| `tabSize`           | `number`                                                                              | Tab size used for indentation. Defaults to `2`.                                                                                                 |
| `insertSpaces`      | `boolean`                                                                             | Whether the editor should insert spaces for indentation. Defaults to `true`. Requires `useDefaultCommands()` extension to work.                 |
| `lineNumbers`       | `boolean`                                                                             | Whether line numbers should be shown. Defaults to `true`.                                                                                       |
| `readOnly`          | `boolean`                                                                             | Whether the editor should be read only. Defaults to `false`.                                                                                    |
| `wordWrap`          | `boolean`                                                                             | Whether the editor should have word wrap. Defaults to `false`.                                                                                  |
| `value`             | `string`                                                                              | Initial value to display in the editor.                                                                                                         |
| `rtl`               | `boolean`                                                                             | Whether the editor uses right to left directionality. Defaults to `false`. Requires extra CSS from `prism-react-editor/rtl-layout.css` to work. |
| `style`             | `Omit<React.CSSProperties, "tabSize">`                                                | Allows adding inline styles to the container element.                                                                                           |
| `textareaProps`     | `Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, OmittedTextareaProps>`       | Allows adding props to the editor's textarea element.                                                                                           |
| `onUpdate`          | `(value: string, editor: PrismEditor) => void`                                        | Function called after the editor updates.                                                                                                       |
| `onSelectionChange` | `(selection: InputSelection, value: string, editor: PrismEditor) => void`             | Function called when the editor's selection changes.                                                                                            |
| `onTokenize`        | `(tokens: TokenStream, language: string, value: string, editor: PrismEditor) => void` | Function called before the tokens are stringified to HTML.                                                                                      |
| `children`          | `(editor: PrismEditor) => React.ReactNode`                                            | Callback used to render extensions.                                                                                                             |

## Pitfall

This component is not controlled, and the `value` prop should be treated like an initial value. Do not change the `value` prop in the `onUpdate` handler. This will cause multiple issues and negatively impact performance.

```jsx
// counterexample: do not do this
function MyEditor() {
  const [value, setValue] = useState("const foo = 'bar'")

  return (
    <Editor language="jsx" value={value} onUpdate={setValue} />
  )
}
```

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

Many commonly used extensions are added by `BasicSetup`, but if you want to fully customize which extensions are added. Below it's shown how to import most extensions.

```tsx
import { Editor, PrismEditor } from "prism-react-editor"
import "prism-react-editor/prism/languages/jsx"
import "prism-react-editor/layout.css"
// Needed for the search widget
import "prism-react-editor/search.css"
// Needed for the copy button
import "prism-react-editor/copy-button.css"

import { useBracketMatcher } from "prism-react-editor/match-brackets"
import { useHightlightBracketPairs } from "prism-react-editor/highlight-brackets"
import { IndentGuides } from "prism-react-editor/guides"
import { useHighlightSelectionMatches, useSearchWidget } from "prism-react-editor/search"
import { useHighlightMatchingTags, useTagMatcher } from "prism-react-editor/match-tags"
import { useCursorPosition } from "prism-react-editor/cursor"
import { useDefaultCommands, useEditHistory } from "prism-react-editor/commands"
import { useCopyButton } from "prism-react-editor/copy-button"
import { useOverscroll } from "prism-react-editor/overscroll"

function MyExtensions({ editor }: { editor: PrismEditor }) {
  useBracketMatcher(editor)
  useHightlightBracketPairs(editor)
  useOverscroll(editor)
  useTagMatcher(editor)
  useHighlightMatchingTags(editor)
  useDefaultCommands(editor)
  useEditHistory(editor)
  useSearchWidget(editor)
  useHighlightSelectionMatches(editor)
  useCopyButton(editor)
  useCursorPosition(editor)

  return <IndentGuides editor={editor} />
}

function MyEditor() {
  return (
    <Editor language="jsx" value="const foo = 'bar'">
      {editor => <MyExtensions editor={editor} />}
    </Editor>
  )
}
```

**Note:** The extensions will rerender whenever the editor components props change. The editor object does not change reference between rerenders, so if you memoize the extensions component with `React.memo`, the extensions won't rerender causing potential issues. If you're using the React Compiler, you might need to add the `"use no memo"` directive to the extensions component so the compiler doesn't memoize it.

Lazy loading extensions is also possible for code splitting. It's not recommended to lazy load `useBracketMatcher` and you might want `IndentGuides` to be present on first render. All other extensions will work perfectly fine while lazy loaded.

```jsx
import { lazy } from "react"

const LazyExtensions = lazy(() => import("./extensions"))

function MyExtensions({ editor }: { editor: PrismEditor }) {
  useBracketMatcher(editor)

  return <IndentGuides editor={editor} />
}

function MyEditor() {
  return (
    <Editor language="jsx" value="const foo = 'bar'">
      {editor => (
        <>
          <MyExtensions editor={editor} />
          <LazyExtensions editor={editor} />
        </>
      )}
    </Editor>
  )
}

```

### Creating your own

If you need to do anything more than adding an `onUpdate` or `onSelectionChange` prop, you should consider creating your own extension.

```tsx
import { useLayoutEffect, useEffect } from "react"
import { PrismEditor, Editor } from "prism-react-editor"
import { BasicSetup } from "prism-react-editor/setups"

function MyExtension({ editor }: { editor: PrismEditor }) {
  // Layout effects will run before the editor has mounted
  useLayoutEffect(() => {
    return editor.on("selectionChange", selection => {
      console.log("Selection changed:", selection)
    })
  }, [])

  useEffect(() => {
    // The editor has mounted now
    editor.textarea!.focus()
  }, [])

  // The elements returned are added to the editor's overlays
  // Keep in mind that they will get some default styles
  return (
    <>
      <div>My overlay</div>
      <BasicSetup editor={editor} />
    </>
  )
}

function MyEditor() {
  return (
    <Editor language="jsx" value="const foo = 'bar'">
      {editor => <MyExtension editor={editor} />}
    </Editor>
  )
}
```

## Editor API

The editor object you can access with the `children` property has many useful properties and methods.

### Properties

- `value: string`: Current value of the editor.
- `activeLine: number`: Line number of the line with the cursor. You can index into `editor.lines` to get the DOM node for the active line.
- `inputCommandMap: Record<string, InputCommandCallback | null | undefined>`: Record mapping an input to a function called when that input is typed.
- `keyCommandMap: Record<string, KeyCommandCallback | null | undefined>`: Record mapping KeyboardEvent.key to a function called when that key is pressed.
- `extensions: Object`: Object storing some of the extensions added to the editor. [Read more](#extensions-property).
- `props: EditorProps`: The component props passed to the editor.
- `focused: boolean`. Whether the `textarea` is focused.
- `tokens: TokenStream`. Current tokens displayed in the editor.

#### DOM Elements

- `container: HTMLDivElement`: This is the outermost element of the editor.
- `wrapper: HTMLDivElement`: Element wrapping the lines and overlays.
- `lines: HTMLCollectionOf<HTMLDivElement>`: Collection containing the overlays as the first element, followed by all code lines.
- `textarea: HTMLTextAreaElement`: Underlying `textarea` in the editor.

### Methods

- `update(): void`: Forces the editor to update. Can be useful after modifying a grammar for example.
- `getSelection(): InputSelection`: Gets the `selectionStart`, `selectionEnd` and `selectionDirection` for the `textarea`.
- `setSelection(start: number, end?: number, direction?: "backward" | "forward" | "none"): void`: Sets the selection for the `textarea` and synchronously updates the `selection` signal.
- `on<T extends keyof EditorEventMap>(name: T, listener: EditorEventMap[T]): () => void`: Adds a listener for editor events and returns a cleanup function. Intended to be used by extensions inside a `useLayoutEffect` or `useEffect` hook.

### Extensions property

Multiple extensions have an entry on `editor.extensions` allowing you to interact with the extension.

- `matchBrackets: BracketMatcher`: Allows access to all brackets found in the editor along with which are paired together.
- `matchTags: TagMatcher`: Allows access to all tags found in the editor along with which tags are paired together.
- `cursor: Cursor`: Allows you to get the cursor position relative to the editor's overlays and to scroll the cursor into view.
- `searchWidget: SearchWidget`: Allows you to open or close the search widget.
- `history: EditHistory`: Allows you to clear the history or navigate it.
- `folding: ReadOnlyCodeFolding`: Allows access to the full unfolded code and to toggle folded ranges.

## Prism

The Prism instance used by this library is exported from `prism-react-editor/prism`. This allows you to add your own Prism grammars or perform syntax highlighting outside of an editor. All modules under `prism-react-editor/prism` can run outside the browser in for example Node.js to do syntax highlighting on the server. [API docs](https://prism-code-editor.netlify.app/api/modules/prism).

## Languages

Prism supports syntax highlighting for hundreds of languages, but none of them are imported by default. You need to choose which languages to import. Importing `prism-react-editor/prism/languages/javascript` for example will register the JavaScript grammar through side effects.

If you need access to many languages, you can import the following entry points:

- `prism-react-editor/prism/languages` for all languages (~180kB)
- `prism-react-editor/prism/languages/common` for [42 common languages](https://github.com/FIameCaster/prism-code-editor/tree/main/package/src/prism/languages/common.js) (~30kB)

This library also supports auto-indenting, comment toggling and self-closing tags for most of these languages. For it to work, you need the `useDefaultCommands()` hook (or the basic setup) and to import the behavior for the language.

The easiest way is to import all languages at ~3.6kB gzipped. You can dynamically import this since it's usually not needed before the page has loaded.

```javascript
import("prism-react-editor/languages")
```

You can also import `prism-react-editor/languages/common` instead to support a subset of common languages at less than 2kB gzipped.

Lastly, if you only need support for a few languages, you can do individual imports, for example `prism-react-editor/languages/html`. [Read more](https://github.com/FIameCaster/prism-code-editor?tab=readme-ov-file#individual-imports).

## Styling

This library does not inject any CSS into the webpage, instead you must import them. If the default styles don't work for you, you can import your own styles instead.

- `prism-react-editor/layout.css` is the layout for the editor.
- `prism-react-editor/scrollbar.css` adds a custom scrollbar to desktop Chrome and Safari you can color with `--editor__bg-scrollbar`.
- `prism-react-editor/copy-button.css` adds styling for the copy button.
- `prism-react-editor/search.css` adds styling for the search widget.
- `prism-react-editor/rtl-layout.css` adds support for the `rtl` prop.

By default, the editor's height will fit the content, so you might want to add a `height` or `max-height` to `.prism-code-editor` depending on your use case.

### Themes

here are currently 13 different themes you can import, one of them being from `prism-react-editor/themes/github-dark.css`.

You can also dynamically import themes into your JavaScript.

```javascript
import { loadTheme } from "prism-react-editor/themes"

const isDark = matchMedia("(prefers-color-scheme: dark)").matches

loadTheme(isDark ? "github-dark" : "github-light").then(theme => {
  console.log(theme)
})
```

If none of the themes fit your website, use one of them as an example to help implement your own.

## Performance

Manual DOM manipulation has been kept almost everywhere. This rewrite therefore has very similar performance to the original which would not be the case if only JSX was used.

## Contributing

Contributions are welcome. To test your changes during development, run `pnpm dev` or `npm run dev` to run the test site.
