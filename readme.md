<h1 align="center">Prism code editor</h1>
<p align="center">
  <a href="https://prism-code-editor.netlify.app">Demos</a> | <a href="https://prism-code-editor.netlify.app/api">API Docs</a>
</p>
<p align="center">
  <a href="https://bundlephobia.com/package/prism-code-editor"><img src="https://img.shields.io/bundlephobia/minzip/prism-code-editor?label=size" alt="Bundle size"></a>
  <a href="https://npmjs.com/prism-code-editor"><img src="https://img.shields.io/npm/v/prism-code-editor" alt="NPM package"></a>
  <a href="https://github.com/FIameCaster/prism-code-editor/releases"><img src="https://img.shields.io/github/v/release/FIameCaster/prism-code-editor" alt="GitHub release"></a>
</p>
<p align="center">
  <strong>Lightweight, extensible code editor component for the web using <a href="https://github.com/PrismJS/prism">Prism</a>.</strong>
</p>
<p align="center">
  <a href="https://prism-code-editor.netlify.app"><img src="https://github.com/FIameCaster/prism-code-editor/blob/3.1.0/assets/demo.png?raw=true" width="640" alt="Editor example"></a>
</p>

## Why?

There are multiple fully featured code editors for the web such as Monaco, Ace and CodeMirror. While these are awesome, they have a large footprint and are likely overkill for code examples, forms, playgrounds or anywhere you won't display large documents.

## How?

This library overlays syntax highlighted code over a `<textarea>`. Libraries like [CodeFlask](https://github.com/kazzkiq/CodeFlask), [react-simple-code-editor](https://github.com/react-simple-code-editor/react-simple-code-editor), and many others have been doing this for years, but this library offers some distinct advantages:

- It uses a trimmed Prism's core less than ⅓ the size that no longer relies on global variables.
- It re-exports Prism's languages that now automatically import their required dependencies and embedded languages are resolved at runtime.
- It splits the highlighted code into lines. This makes it easy to add line numbers, highlight a line and only update changed lines in the DOM for efficient updates.
- The core is light as a feather with a wide array of [extensions](#extensions) you can choose from and [multiple events](#events) to listen to.

## Contents

- [Installation](#installation)
- [Basic usage](#basic-usage)
- [Advanced usage](#advanced-usage)
- [Usage with frameworks](#usage-with-frameworks)
- [Options](#options)
- [Events](#events)
- [Importing Prism](#importing-prism)
  - [Importing grammars](#importing-grammars)
- [Usage with Node.js](#usage-with-nodejs)
- [Examples](#examples)
- [Extensions](#extensions)
  - [Importing extensions](#importing-extensions)
  - [Creating your own](#creating-your-own)
- [Styling](#styling)
  - [Importing themes](#importing-themes)
  - [Adding themes](#adding-themes)
  - [Scrollbar styling](#scrollbar-styling)
  - [Advanced styling](#advanced-styling)
    - [Creating a theme](#creating-a-theme)
- [Language specific behavior](#language-specific-behavior)
  - [Importing](#importing)
    - [Individual imports](#individual-imports)
  - [Adding your own](#adding-your-own)
- [Avoiding layout shifts](#avoiding-layout-shifts)
- [Tooltips](#tooltips)
- [Overscroll](#overscroll)
- [RTL support](#rtl-support)
- [Editing key commands](#editing-key-commands)
- [Web components](#web-components)
- [Performance](#performance)
- [Compatibility](#compatibility)
- [Credits](#credits)
- [Contributing](#contributing)

## Installation

    npm i prism-code-editor

## Basic usage

The library includes 4 different setups you can import. These will automatically import the necessary styles and scope them with a shadow root, add various extensions and import all language specific behavior. There are also [web components](#web-components) wrapping these setups if that's preferred.

These setups are very cumbersome to customize and are therefore only recommended while getting started.

```javascript
import { minimalEditor, basicEditor, fullEditor, readonlyEditor } from "prism-code-editor/setups"
// Importing Prism grammars
import "prism-code-editor/prism/languages/markup"

const editor = basicEditor(
  "#editor",
  {
    language: "html",
    theme: "github-dark",
  },
  () => console.log("ready"),
)
```

**Note:** You might want to add `display: grid` to the container the editor is added to.

## Advanced usage

With little effort, you can fully customize which extensions are added and how they're loaded. This won't use a shadow root which makes the editor much easier to style and customize.

```javascript
// index.ts
import "prism-code-editor/prism/languages/markup"
import "prism-code-editor/prism/languages/css-extras"
import "prism-code-editor/prism/languages/javascript"

import { createEditor } from "prism-code-editor"
import { matchBrackets } from "prism-code-editor/match-brackets"
import { indentGuides } from "prism-code-editor/guides"

// Importing styles
import "prism-code-editor/layout.css"
import "prism-code-editor/scrollbar.css"
import "prism-code-editor/themes/github-dark.css"

export const editor = createEditor(
  "#editor",
  { language: "html" },
  indentGuides(),
  matchBrackets(),
)
  
import("./extensions")
```

To minimize your main JavaScript bundle, you can dynamically import all extensions *(but some probably shouldn't be)*.

```typescript
// extensions.ts
import "prism-code-editor/search.css"
import "prism-code-editor/copy-button.css"
import "prism-code-editor/languages/html"
import "prism-code-editor/languages/clike"
import "prism-code-editor/languages/css"

import { searchWidget, highlightSelectionMatches } from "prism-code-editor/search"
import { defaultCommands, editHistory } from "prism-code-editor/commands"
import { cursorPosition } from "prism-code-editor/cursor"
import { copyButton } from "prism-code-editor/copy-button"
import { matchTags } from "prism-code-editor/match-tags"
import { highlightBracketPairs } from "prism-code-editor/highlight-brackets"
import { editor } from "./index"

editor.addExtensions(
  highlightSelectionMatches(),
  searchWidget(),
  defaultCommands(),
  copyButton(),
  matchTags(),
  highlightBracketPairs(),
  cursorPosition(),
  editHistory(),
)
```

## Usage with frameworks

This library has been rewritten for React and SolidJS. These rewrites better integrate with their respective framework than any wrapper ever could and are highly recommended if you're already using React or SolidJS.

- [React rewrite](https://github.com/FIameCaster/prism-react-editor)
- [SolidJS rewrite](https://github.com/FIameCaster/solid-prism-editor)

## Options

| Name | Type | Description |
| ---- | ---- | ----------- |
| `language` | `string` | Language used for syntax highlighting. Defaults to `text`. |
| `tabSize` | `number` | Tab size used for indentation. Defaults to `2`. |
| `insertSpaces` | `boolean` | Whether the editor should insert spaces for indentation. Defaults to `true`. Requires the `defaultCommands()` extension to work. |
| `lineNumbers` | `boolean` | Whether line numbers should be shown. Defaults to `true`. |
| `readOnly` | `boolean` | Whether the editor should be read only. Defaults to `false`. |
| `wordWrap` | `boolean` | Whether the editor should have word wrap. Defaults to `false`. |
| `value` | `string` | Initial value to display in the editor. |
| `rtl` | `boolean` | Whether the editor uses right to left directionality. Defaults to `false`. Requires extra CSS from `prism-code-editor/rtl-layout.css` to work. |
| `onUpdate` | `(value: string => void` | Function called after the editor updates. |
| `onSelectionChange` | `(selection: InputSelection, value: string) => void` | Function called when the editor's selection changes. |
| `onTokenize` | `(tokens: TokenStream, language: string, value: string) => void` | Function called before the tokens are stringified to HTML. |

## Events

There are three different event both you and extensions can listen to: `tokenize`, `update` and `selectionChange`.

The `tokenize` event is dispatched after the code is tokenized, which makes it possible to change the tokens before the HTML string is created.

The `update` event is dispatched after the syntax highlighted DOM has been updated.

The `selectionChange` event is dispatched right after the `update` event or when the user changes the selection.

## Importing Prism

If you want to add your own language to Prism or perform syntax highlighting outside of an editor, this is where to import from:

```javascript
import {
  // Functions
  highlightText,
  highlightTokens,
  tokenizeText,
  withoutTokenizer,
  // Record storing loaded languages
  languages,
  // Symbols used in grammars
  tokenize,
  rest,
  // Token class
  Token
} from "prism-code-editor/prism"

// Utilities used by grammars
import {
  clone, insertBefore, extend, embeddedIn
} from "prism-code-editor/prism/utils"

// To add your own language, just mutate the languages record
languages["my-language"] = {
  // ...
}
```

For more information about these exports, read the [API documentation](https://prism-code-editor.netlify.app/api/modules/prism).

**Note:** CRLF and CR line breaks are not supported. So before highlighting, you might need to normalize line breaks using something like `text.replace(/\r\n?/g, "\n")`.

### Importing grammars

As you might've seen from the examples, prism grammars are imported from `prism-code-editor/prism/languages/*`. Importing a grammar will automatically register it through side effects. If you're importing multiple grammars, import order usually won't matter. The exception comes when grammars modify other grammars. Take this example:

```javascript
import "prism-code-editor/prism/languages/typescript"
import "prism-code-editor/prism/languages/js-templates"
```

This won't add `js-templates` features to `typescript` because it extended `javascript` before `js-templates` was added. Swapping the import order fixes the issue.

If you need access to many languages, you can import the following entry points:

- `prism-code-editor/prism/languages` for all languages (~180kB)
- `prism-code-editor/prism/languages/common` for [42 common languages](https://github.com/FIameCaster/prism-code-editor/tree/main/package/src/prism/languages/common.js) (~30kB)

Take this simple markdown editor as an example. Here, only the markdown grammar is required initially. The common languages are dynamically imported and once they load, the editor is updated, which will highlight all markdown code blocks.

```javascript
import "prism-code-editor/prism/languages/markdown"
import { createEditor } from "prism-code-editor"

const editor = createEditor("#editor", { language: "markdown" })

import("prism-code-editor/prism/languages/common").then(() => editor.update())
```

## Usage with Node.js

The entry points `prism-code-editor/prism`, `prism-code-editor/prism/utils` and the grammars from `prism-code-editor/prism/languages/*` can all run on Node.js for those who want to generate HTML with it.

## Examples

- [`height: auto` without layout shifts](https://stackblitz.com/edit/vitejs-vite-sbvab7?file=index.html,src%2Fstyle.css,src%2Fmain.ts,readme.md)
- [Simple tooltip example](https://stackblitz.com/edit/vitejs-vite-z2fgpu?file=src%2Fmain.ts)
- [Autocomplete example](https://stackblitz.com/edit/vitejs-vite-tjcjyl?file=src%2Fautocomplete.ts)
- [Formatting with Prettier](https://stackblitz.com/edit/vitejs-vite-x7tzhu?file=src%2Fmain.ts,src%2Fextensions.ts)
- [Relative line numbers](https://stackblitz.com/edit/vitejs-vite-2wytja?file=src%2Fextensions.ts,src%2Fmain.ts)
- [Usage in forms](https://stackblitz.com/edit/vitejs-vite-pk9ud7?file=src%2Fmain.ts)
- [Adding elements to code lines](https://stackblitz.com/edit/vitejs-vite-y5pwon?file=src%2Fmain.ts,readme.md)
- [Custom cursor](https://stackblitz.com/edit/vitejs-vite-sza5zx?file=src%2Fstyle.css,src%2Fextensions.ts)

## Extensions

Most behavior isn't included by default and must be imported. This is to keep the core small for those who don't need the extra functionality. See [advanced usage](#advanced-usage) for how to add extensions.

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

The default commands extension includes:

- Wrapping selection in brackets/quotes
- Automatic closing of brackets, quotes, and tags
- Automatic indentation and indentation with Tab key

And it includes these commands:

- Alt+ArrowUp/Down: Move line up/down
- Shift+Alt+ArrowUp/Down: Copy line up/down
- Ctrl+ArrowUp/Down (Not on MacOS): Scroll up/down 1 line
- Ctrl+Enter (Cmd+Enter on MacOS) Insert blank line
- Ctrl+[ (Cmd+[ on MacOS): Outdent line
- Ctrl+] (Cmd+] on MacOS): Indent line
- Shift+Ctrl+K (Shift+Cmd+K on MacOS): Delete line
- Ctrl+/ (Cmd+/ on MacOS): Toggle comment
- Shift+Alt+A: Toggle block comment
- Ctrl+M (Ctrl+Shift+M on MacOS): Toggle Tab capturing

### Importing extensions

```javascript
import { matchBrackets } from "prism-code-editor/match-brackets"
import { matchTags } from "prism-code-editor/match-tags"
import { indentGuides } from "prism-code-editor/guides"
import {
  searchWidget,
  highlightSelectionMatches,
  highlightCurrentWord,
  showInvisibles
} from "prism-code-editor/search"
import { defaultCommands, editHistory } from "prism-code-editor/commands"
import { cursorPosition } from "prism-code-editor/cursor"
import { copyButton } from "prism-code-editor/copy-button"
import { highlightBracketPairs } from "prism-code-editor/highlight-brackets"
import {
  readOnlycodeFolding,
  markdownFolding,
  blockCommentFolding
} from "prism-code-editor/code-folding"
import { autoComplete } from "prism-code-editor/autocomplete"

// And CSS
import "prism-code-editor/search.css"
import "prism-code-editor/copy-button.css"
import "prism-code-editor/code-folding.css"
import "prism-code-editor/invisibles.css"
import "prism-code-editor/autocomplete.css"
import "prism-code-editor/autocomplete-icons.css"
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
      // And when the options change
    },
  }
}
```

You can also write a class with an update method if that's preferred.

You can also use a plain function as an extension. This function won't be called when the editor's options change.

```typescript
import { BasicExtension, createEditor } from "prism-code-editor"

const myExtension = (): BasicExtension => {
  return (editor, options) => {
    // This won't be called when the options change
  }
}

createEditor("#editor", {}, (editor, options) => {
  // This will be called before the first render
})
```

## Handling Tab

If you're adding the default commands to your editor, the tab key is used for indentation. If this isn't wanted, you can change the behavior. 

Users can at any time toggle tab capturing with Ctrl+M / Ctrl+Shift+M (Mac).

```javascript
import { setIgnoreTab } from "prism-code-editor/commands"
setIgnoreTab(true)
```

## Styling

### Importing themes

There are currently 13 different themes you can import, one of them being from `prism-code-editor/themes/github-dark.css`.

You can also dynamically import themes into your JavaScript. This is used by the demo website.

```javascript
import { loadTheme } from "prism-code-editor/themes"

const isDark = matchMedia("(prefers-color-scheme: dark)").matches

loadTheme(isDark ? "github-dark" : "github-light").then(theme => {
  console.log(theme)
})
```

### Adding themes

If you're using the setups or web components, you can override the existing themes or add new ones. The example below might be different if you're not using Vite as your bundler.

```javascript
import { registerTheme } from "prism-code-editor/themes"

registerTheme("my-theme", () => import("./my-theme.css?inline"))
```

### Scrollbar styling

You can import a stylesheet that will give a custom scrollbar to desktop Chrome and Safari.

```javascript
import "prism-code-editor/scrollbar.css"
```

You can change the color of the scrollbar thumb using the custom property `--editor__bg-scrollbar`. Different alphas will be set based on the state of the scrollbar thumb.

```css
.prism-code-editor {
  /* Values are: Hue, saturation, lightness */
  --editor__bg-scrollbar: 210, 10%, 40%;
}
```

### Advanced styling

If you're not using any of the setups, the styles aren't scoped using a shadow root, which makes them easy to change. If you want to change color, background, font, line-height or similar, you can do it on `.prism-code-editor` with CSS.

Default padding is `0.75em` left/right and `0.5em` top/bottom. If you want to change it, you can use the custom property `--padding-inline` for left/right. Padding top and bottom can changed by changing the margin on `.pce-wrapper`.

There are many classes added to `.prism-code-editor` you can use to style the editor based on its state:

- `pce-has-selection` if the textarea has a selection, and `pce-no-selection` if not
- `pce-focus` if the textarea is focused
- `show-line-numbers` if line numbers are enabled
- `pce-wrap` if word wrap is enabled, and `pce-nowrap` if not
- `pce-readonly` if the editor is read-only

#### Creating a theme

It's likely that none of the themes perfectly fit your website. A great solution is to modify one of the [included themes](https://github.com/FIameCaster/prism-code-editor/tree/main/package/src/themes) to better suit your website. Alternatively, you can import one of the themes and override some of the styles in your on stylesheets.

Below is some additional styling information:

- `.pce-line::before` will match a line number
- `.pce-line.active-line` matches the line with the cursor
- `.prism-code-editor::before` is the background for the line numbers
- The variable `--number-spacing` is the spacing to the right of the line numbers which defaults to `0.75em`

## Language specific behavior

If you're not using the setups, automatic indentation, toggling comments, and automatic closing of tags won't work. You'll need to import the behavior or define it yourself.

### Importing

The easiest way to get this working, is to import all languages. This will add comment toggling, etc. to almost all Prism languages at ~3.6kB gzipped. It's recommended to dynamically import this since it's usually not needed before the page has loaded.

```javascript
import("prism-code-editor/languages")
```

You can also import `prism-code-editor/languages/common` instead to support a subset of common languages at less than 2kB gzipped.

#### Individual imports

Lastly, if you know exactly which languages you need, you can import behavior for individual languages. Refer to the list below for which imports adds comment toggling, etc. to which language(s).

<details>
  <summary>List of all imports</summary>
  <br>
  <p>The import for <code>ada</code> would be <code>prism-code-editor/languages/ada</code> for example. This list is <strong>NOT</strong> for Prism grammars.</p>
  <table>
    <thead>
      <tr><th>Import</th><th>Languages/aliases added</th></tr>
    </thead>
    <tbody>
      <tr><td><code>abap</code></td><td><code>abap</code></td></tr>
      <tr><td><code>abnf</code></td><td><code>abnf</code></td></tr>
      <tr><td><code>actionscript</code></td><td><code>actionscript</code></td></tr>
      <tr><td><code>ada</code></td><td><code>ada</code></td></tr>
      <tr><td><code>agda</code></td><td><code>agda</code></td></tr>
      <tr><td><code>al</code></td><td><code>al</code></td></tr>
      <tr><td><code>antlr4</code></td><td><code>g4</code> and <code>antlr4</code></td></tr>
      <tr><td><code>apacheconf</code></td><td><code>apacheconf</code></td></tr>
      <tr><td><code>apex</code></td><td><code>apex</code></td></tr>
      <tr><td><code>apl</code></td><td><code>apl</code></td></tr>
      <tr><td><code>applescript</code></td><td><code>applescript</code></td></tr>
      <tr><td><code>aql</code></td><td><code>aql</code></td></tr>
      <tr><td><code>arduino</code></td><td><code>ino</code> and <code>arduino</code></td></tr>
      <tr><td><code>arff</code></td><td><code>arff</code></td></tr>
      <tr><td><code>arturo</code></td><td><code>art</code> and <code>arturo</code></td></tr>
      <tr><td><code>asciidoc</code></td><td><code>adoc</code> and <code>asciidoc</code></td></tr>
      <tr><td><code>asm</code></td><td><code>arm-asm</code>, <code>armasm</code>, <code>asm6502</code>, <code>asmatmel</code> and <code>nasm</code></td></tr>
      <tr><td><code>aspnet</code></td><td><code>aspnet</code></td></tr>
      <tr><td><code>autohotkey</code></td><td><code>autohotkey</code></td></tr>
      <tr><td><code>autoit</code></td><td><code>autoit</code></td></tr>
      <tr><td><code>avisynth</code></td><td><code>avs</code> and <code>avisynth</code></td></tr>
      <tr><td><code>avro-idl</code></td><td><code>avdl</code> and <code>avro-idl</code></td></tr>
      <tr><td><code>awk</code></td><td><code>awk</code></td></tr>
      <tr><td><code>bash</code></td><td><code>sh</code>, <code>shell</code> and <code>bash</code></td></tr>
      <tr><td><code>basic</code></td><td><code>basic</code></td></tr>
      <tr><td><code>batch</code></td><td><code>batch</code></td></tr>
      <tr><td><code>bbj</code></td><td><code>bbj</code></td></tr>
      <tr><td><code>bicep</code></td><td><code>bicep</code></td></tr>
      <tr><td><code>birb</code></td><td><code>birb</code></td></tr>
      <tr><td><code>bison</code></td><td><code>bison</code></td></tr>
      <tr><td><code>bqn</code></td><td><code>bqn</code></td></tr>
      <tr><td><code>brightscript</code></td><td><code>brightscript</code></td></tr>
      <tr><td><code>bro</code></td><td><code>bro</code></td></tr>
      <tr><td><code>bsl</code></td><td><code>bsl</code></td></tr>
      <tr><td><code>cfscript</code></td><td><code>cfscript</code></td></tr>
      <tr><td><code>chaiscript</code></td><td><code>chaiscript</code></td></tr>
      <tr><td><code>cil</code></td><td><code>cil</code></td></tr>
      <tr><td><code>cilk</code></td><td><code>cilk-c</code>, <code>cilkc</code>, <code>cilk</code>, <code>cilk-cpp</code> and <code>cilkcpp</code></td></tr>
      <tr><td><code>clike</code></td><td><code>clike</code>, <code>js</code>, <code>javascript</code>, <code>ts</code>, <code>typescript</code>, <code>java</code>, <code>cs</code>, <code>csharp</code>, <code>c</code>, <code>cpp</code>, <code>go</code>, <code>d</code>, <code>dart</code>, <code>flow</code> and <code>haxe</code></td></tr>
      <tr><td><code>clojure</code></td><td><code>clojure</code></td></tr>
      <tr><td><code>cmake</code></td><td><code>cmake</code></td></tr>
      <tr><td><code>cobol</code></td><td><code>cobol</code></td></tr>
      <tr><td><code>coffeescript</code></td><td><code>coffee</code> and <code>coffeescript</code></td></tr>
      <tr><td><code>concurnas</code></td><td><code>conc</code> and <code>concurnas</code></td></tr>
      <tr><td><code>cooklang</code></td><td><code>cooklang</code></td></tr>
      <tr><td><code>coq</code></td><td><code>coq</code></td></tr>
      <tr><td><code>cshtml</code></td><td><code>razor</code> and <code>cshtml</code></td></tr>
      <tr><td><code>css</code></td><td><code>css</code>, <code>less</code>, <code>scss</code> and <code>sass</code></td></tr>
      <tr><td><code>cue</code></td><td><code>cue</code></td></tr>
      <tr><td><code>cypher</code></td><td><code>cypher</code></td></tr>
      <tr><td><code>dataweave</code></td><td><code>dataweave</code></td></tr>
      <tr><td><code>dax</code></td><td><code>dax</code></td></tr>
      <tr><td><code>dhall</code></td><td><code>dhall</code></td></tr>
      <tr><td><code>django</code></td><td><code>jinja2</code> and <code>django</code></td></tr>
      <tr><td><code>dns-zone-file</code></td><td><code>dns-zone</code> and <code>dns-zone-file</code></td></tr>
      <tr><td><code>docker</code></td><td><code>dockerfile</code> and <code>docker</code></td></tr>
      <tr><td><code>dot</code></td><td><code>gv</code> and <code>dot</code></td></tr>
      <tr><td><code>ebnf</code></td><td><code>ebnf</code></td></tr>
      <tr><td><code>editorconfig</code></td><td><code>editorconfig</code></td></tr>
      <tr><td><code>eiffel</code></td><td><code>eiffel</code></td></tr>
      <tr><td><code>ejs</code></td><td><code>ejs</code></td></tr>
      <tr><td><code>elixir</code></td><td><code>elixir</code></td></tr>
      <tr><td><code>elm</code></td><td><code>elm</code></td></tr>
      <tr><td><code>erb</code></td><td><code>erb</code></td></tr>
      <tr><td><code>erlang</code></td><td><code>erlang</code></td></tr>
      <tr><td><code>etlua</code></td><td><code>etlua</code></td></tr>
      <tr><td><code>excel-formula</code></td><td><code>xlsx</code>, <code>xls</code> and <code>excel-formula</code></td></tr>
      <tr><td><code>factor</code></td><td><code>factor</code></td></tr>
      <tr><td><code>false</code></td><td><code>false</code></td></tr>
      <tr><td><code>firestore-security-rules</code></td><td><code>firestore-security-rules</code></td></tr>
      <tr><td><code>fortran</code></td><td><code>fortran</code></td></tr>
      <tr><td><code>fsharp</code></td><td><code>fsharp</code></td></tr>
      <tr><td><code>ftl</code></td><td><code>ftl</code></td></tr>
      <tr><td><code>gap</code></td><td><code>gap</code></td></tr>
      <tr><td><code>gcode</code></td><td><code>gcode</code></td></tr>
      <tr><td><code>gdscript</code></td><td><code>gdscript</code></td></tr>
      <tr><td><code>gettext</code></td><td><code>gettext</code></td></tr>
      <tr><td><code>gherkin</code></td><td><code>gherkin</code></td></tr>
      <tr><td><code>git</code></td><td><code>git</code></td></tr>
      <tr><td><code>glsl</code></td><td><code>glsl</code> and <code>hlsl</code></td></tr>
      <tr><td><code>gml</code></td><td><code>gamemakerlanguage</code> and <code>gml</code></td></tr>
      <tr><td><code>gn</code></td><td><code>gni</code> and <code>gn</code></td></tr>
      <tr><td><code>go-module</code></td><td><code>go-mod</code> and <code>go-module</code></td></tr>
      <tr><td><code>gradle</code></td><td><code>gradle</code></td></tr>
      <tr><td><code>graphql</code></td><td><code>graphql</code></td></tr>
      <tr><td><code>groovy</code></td><td><code>groovy</code></td></tr>
      <tr><td><code>haml</code></td><td><code>haml</code></td></tr>
      <tr><td><code>handlebars</code></td><td><code>mustache</code>, <code>hbs</code> and <code>handlebars</code></td></tr>
      <tr><td><code>haskell</code></td><td><code>idr</code>, <code>idris</code>, <code>hs</code>, <code>haskell</code>, <code>purs</code> and <code>purescript</code></td></tr>
      <tr><td><code>hcl</code></td><td><code>hcl</code></td></tr>
      <tr><td><code>hoon</code></td><td><code>hoon</code></td></tr>
      <tr><td><code>html</code></td><td><code>markup</code>, <code>html</code>, <code>markdown</code> and <code>md</code></td></tr>
      <tr><td><code>ichigojam</code></td><td><code>ichigojam</code></td></tr>
      <tr><td><code>icon</code></td><td><code>icon</code></td></tr>
      <tr><td><code>iecst</code></td><td><code>iecst</code></td></tr>
      <tr><td><code>ignore</code></td><td><code>npmignore</code>, <code>hgignore</code>, <code>gitignore</code> and <code>ignore</code></td></tr>
      <tr><td><code>inform7</code></td><td><code>inform7</code></td></tr>
      <tr><td><code>ini</code></td><td><code>ini</code></td></tr>
      <tr><td><code>io</code></td><td><code>io</code></td></tr>
      <tr><td><code>j</code></td><td><code>j</code></td></tr>
      <tr><td><code>jolie</code></td><td><code>jolie</code></td></tr>
      <tr><td><code>jq</code></td><td><code>jq</code></td></tr>
      <tr><td><code>json</code></td><td><code>json</code>, <code>json5</code> and <code>jsonp</code></td></tr>
      <tr><td><code>jsx</code></td><td><code>jsx</code> and <code>tsx</code></td></tr>
      <tr><td><code>julia</code></td><td><code>julia</code></td></tr>
      <tr><td><code>keepalived</code></td><td><code>keepalived</code></td></tr>
      <tr><td><code>keyman</code></td><td><code>keyman</code></td></tr>
      <tr><td><code>kotlin</code></td><td><code>kts</code>, <code>kt</code> and <code>kotlin</code></td></tr>
      <tr><td><code>kumir</code></td><td><code>kumir</code></td></tr>
      <tr><td><code>kusto</code></td><td><code>kusto</code></td></tr>
      <tr><td><code>latex</code></td><td><code>context</code>, <code>tex</code> and <code>latex</code></td></tr>
      <tr><td><code>latte</code></td><td><code>latte</code></td></tr>
      <tr><td><code>lilypond</code></td><td><code>ly</code> and <code>lilypond</code></td></tr>
      <tr><td><code>linker-script</code></td><td><code>ld</code> and <code>linker-script</code></td></tr>
      <tr><td><code>liquid</code></td><td><code>liquid</code></td></tr>
      <tr><td><code>lisp</code></td><td><code>emacs-lisp</code>, <code>emacs</code>, <code>elisp</code> and <code>lisp</code></td></tr>
      <tr><td><code>livescript</code></td><td><code>livescript</code></td></tr>
      <tr><td><code>llvm</code></td><td><code>llvm</code></td></tr>
      <tr><td><code>lolcode</code></td><td><code>lolcode</code></td></tr>
      <tr><td><code>lua</code></td><td><code>lua</code></td></tr>
      <tr><td><code>magma</code></td><td><code>magma</code></td></tr>
      <tr><td><code>makefile</code></td><td><code>makefile</code></td></tr>
      <tr><td><code>mata</code></td><td><code>mata</code></td></tr>
      <tr><td><code>matlab</code></td><td><code>matlab</code></td></tr>
      <tr><td><code>maxscript</code></td><td><code>maxscript</code></td></tr>
      <tr><td><code>mel</code></td><td><code>mel</code></td></tr>
      <tr><td><code>mermaid</code></td><td><code>mermaid</code></td></tr>
      <tr><td><code>metafont</code></td><td><code>metafont</code></td></tr>
      <tr><td><code>mizar</code></td><td><code>mizar</code></td></tr>
      <tr><td><code>mongodb</code></td><td><code>mongodb</code></td></tr>
      <tr><td><code>monkey</code></td><td><code>monkey</code></td></tr>
      <tr><td><code>moonscript</code></td><td><code>moon</code> and <code>moonscript</code></td></tr>
      <tr><td><code>n1ql</code></td><td><code>n1ql</code></td></tr>
      <tr><td><code>n4js</code></td><td><code>n4jsd</code> and <code>n4js</code></td></tr>
      <tr><td><code>nand2tetris-hdl</code></td><td><code>nand2tetris-hdl</code></td></tr>
      <tr><td><code>naniscript</code></td><td><code>nani</code> and <code>naniscript</code></td></tr>
      <tr><td><code>neon</code></td><td><code>neon</code></td></tr>
      <tr><td><code>nevod</code></td><td><code>nevod</code></td></tr>
      <tr><td><code>nginx</code></td><td><code>nginx</code></td></tr>
      <tr><td><code>nim</code></td><td><code>nim</code></td></tr>
      <tr><td><code>nix</code></td><td><code>nix</code></td></tr>
      <tr><td><code>nsis</code></td><td><code>nsis</code></td></tr>
      <tr><td><code>objectivec</code></td><td><code>objc</code> and <code>objectivec</code></td></tr>
      <tr><td><code>ocaml</code></td><td><code>ocaml</code></td></tr>
      <tr><td><code>odin</code></td><td><code>odin</code></td></tr>
      <tr><td><code>opencl</code></td><td><code>opencl</code></td></tr>
      <tr><td><code>openqasm</code></td><td><code>qasm</code> and <code>openqasm</code></td></tr>
      <tr><td><code>oz</code></td><td><code>oz</code></td></tr>
      <tr><td><code>parigp</code></td><td><code>parigp</code></td></tr>
      <tr><td><code>parser</code></td><td><code>parser</code></td></tr>
      <tr><td><code>pascal</code></td><td><code>pascaligo</code>, <code>objectpascal</code> and <code>pascal</code></td></tr>
      <tr><td><code>peoplecode</code></td><td><code>pcode</code> and <code>peoplecode</code></td></tr>
      <tr><td><code>perl</code></td><td><code>perl</code></td></tr>
      <tr><td><code>php</code></td><td><code>php</code></td></tr>
      <tr><td><code>plant-uml</code></td><td><code>plantuml</code> and <code>plant-uml</code></td></tr>
      <tr><td><code>powerquery</code></td><td><code>mscript</code>, <code>pq</code> and <code>powerquery</code></td></tr>
      <tr><td><code>powershell</code></td><td><code>powershell</code></td></tr>
      <tr><td><code>processing</code></td><td><code>processing</code></td></tr>
      <tr><td><code>prolog</code></td><td><code>prolog</code></td></tr>
      <tr><td><code>promql</code></td><td><code>promql</code></td></tr>
      <tr><td><code>properties</code></td><td><code>properties</code></td></tr>
      <tr><td><code>protobuf</code></td><td><code>protobuf</code></td></tr>
      <tr><td><code>psl</code></td><td><code>psl</code></td></tr>
      <tr><td><code>pug</code></td><td><code>pug</code></td></tr>
      <tr><td><code>puppet</code></td><td><code>puppet</code></td></tr>
      <tr><td><code>pure</code></td><td><code>pure</code></td></tr>
      <tr><td><code>purebasic</code></td><td><code>pbfasm</code> and <code>purebasic</code></td></tr>
      <tr><td><code>python</code></td><td><code>rpy</code>, <code>renpy</code>, <code>py</code> and <code>python</code></td></tr>
      <tr><td><code>q</code></td><td><code>q</code></td></tr>
      <tr><td><code>qml</code></td><td><code>qml</code></td></tr>
      <tr><td><code>qore</code></td><td><code>qore</code></td></tr>
      <tr><td><code>qsharp</code></td><td><code>qs</code> and <code>qsharp</code></td></tr>
      <tr><td><code>r</code></td><td><code>r</code></td></tr>
      <tr><td><code>reason</code></td><td><code>reason</code></td></tr>
      <tr><td><code>rego</code></td><td><code>rego</code></td></tr>
      <tr><td><code>rescript</code></td><td><code>res</code> and <code>rescript</code></td></tr>
      <tr><td><code>rest</code></td><td><code>rest</code></td></tr>
      <tr><td><code>rip</code></td><td><code>rip</code></td></tr>
      <tr><td><code>roboconf</code></td><td><code>roboconf</code></td></tr>
      <tr><td><code>robotframework</code></td><td><code>robot</code> and <code>robotframework</code></td></tr>
      <tr><td><code>ruby</code></td><td><code>crystal</code>, <code>rb</code> and <code>ruby</code></td></tr>
      <tr><td><code>rust</code></td><td><code>rust</code></td></tr>
      <tr><td><code>sas</code></td><td><code>sas</code></td></tr>
      <tr><td><code>scala</code></td><td><code>scala</code></td></tr>
      <tr><td><code>scheme</code></td><td><code>racket</code> and <code>scheme</code></td></tr>
      <tr><td><code>smali</code></td><td><code>smali</code></td></tr>
      <tr><td><code>smalltalk</code></td><td><code>smalltalk</code></td></tr>
      <tr><td><code>smarty</code></td><td><code>smarty</code></td></tr>
      <tr><td><code>sml</code></td><td><code>smlnj</code> and <code>sml</code></td></tr>
      <tr><td><code>solidity</code></td><td><code>sol</code> and <code>solidity</code></td></tr>
      <tr><td><code>solution-file</code></td><td><code>sln</code> and <code>solution-file</code></td></tr>
      <tr><td><code>soy</code></td><td><code>soy</code></td></tr>
      <tr><td><code>splunk-spl</code></td><td><code>splunk-spl</code></td></tr>
      <tr><td><code>sqf</code></td><td><code>sqf</code></td></tr>
      <tr><td><code>sql</code></td><td><code>plsql</code> and <code>sql</code></td></tr>
      <tr><td><code>squirrel</code></td><td><code>squirrel</code></td></tr>
      <tr><td><code>stan</code></td><td><code>stan</code></td></tr>
      <tr><td><code>stata</code></td><td><code>stata</code></td></tr>
      <tr><td><code>stylus</code></td><td><code>stylus</code></td></tr>
      <tr><td><code>supercollider</code></td><td><code>sclang</code> and <code>supercollider</code></td></tr>
      <tr><td><code>swift</code></td><td><code>swift</code></td></tr>
      <tr><td><code>systemd</code></td><td><code>systemd</code></td></tr>
      <tr><td><code>tcl</code></td><td><code>tcl</code></td></tr>
      <tr><td><code>textile</code></td><td><code>textile</code></td></tr>
      <tr><td><code>toml</code></td><td><code>toml</code></td></tr>
      <tr><td><code>tremor</code></td><td><code>trickle</code>, <code>troy</code> and <code>tremor</code></td></tr>
      <tr><td><code>tt2</code></td><td><code>tt2</code></td></tr>
      <tr><td><code>turtle</code></td><td><code>rq</code>, <code>sparql</code>, <code>trig</code> and <code>turtle</code></td></tr>
      <tr><td><code>twig</code></td><td><code>twig</code></td></tr>
      <tr><td><code>typoscript</code></td><td><code>tsconfig</code> and <code>typoscript</code></td></tr>
      <tr><td><code>unrealscript</code></td><td><code>uc</code>, <code>uscript</code> and <code>unrealscript</code></td></tr>
      <tr><td><code>uorazor</code></td><td><code>uorazor</code></td></tr>
      <tr><td><code>v</code></td><td><code>v</code></td></tr>
      <tr><td><code>vala</code></td><td><code>vala</code></td></tr>
      <tr><td><code>vbnet</code></td><td><code>vbnet</code></td></tr>
      <tr><td><code>velocity</code></td><td><code>velocity</code></td></tr>
      <tr><td><code>verilog</code></td><td><code>verilog</code></td></tr>
      <tr><td><code>vhdl</code></td><td><code>vhdl</code></td></tr>
      <tr><td><code>vim</code></td><td><code>vim</code></td></tr>
      <tr><td><code>visual-basic</code></td><td><code>vba</code>, <code>vb</code> and <code>visual-basic</code></td></tr>
      <tr><td><code>warpscript</code></td><td><code>warpscript</code></td></tr>
      <tr><td><code>wasm</code></td><td><code>wasm</code></td></tr>
      <tr><td><code>web-idl</code></td><td><code>webidl</code> and <code>web-idl</code></td></tr>
      <tr><td><code>wgsl</code></td><td><code>wgsl</code></td></tr>
      <tr><td><code>wiki</code></td><td><code>wiki</code></td></tr>
      <tr><td><code>wolfram</code></td><td><code>nb</code>, <code>wl</code>, <code>mathematica</code> and <code>wolfram</code></td></tr>
      <tr><td><code>wren</code></td><td><code>wren</code></td></tr>
      <tr><td><code>xeora</code></td><td><code>xeoracube</code> and <code>xeora</code></td></tr>
      <tr><td><code>xml</code></td><td><code>xml</code>, <code>ssml</code>, <code>atom</code>, <code>rss</code>, <code>mathml</code> and <code>svg</code></td></tr>
      <tr><td><code>xojo</code></td><td><code>xojo</code></td></tr>
      <tr><td><code>xquery</code></td><td><code>xquery</code></td></tr>
      <tr><td><code>yaml</code></td><td><code>yml</code> and <code>yaml</code></td></tr>
      <tr><td><code>yang</code></td><td><code>yang</code></td></tr>
      <tr><td><code>zig</code></td><td><code>zig</code></td></tr>
    </tbody>
  </table>
</details>

### Adding your own

```javascript
import { languageMap } from "prism-code-editor"

languageMap.whatever = {
  comments: {
    line: "//",
    block: ["/*", "*/"]
  },
  getComments(editor, position) {
    // Method called when a user executes a comment toggling command
    // Useful if a language uses different comment tokens in different contexts
    // Currently used by JSX so {/* */} is used to toggle comments in JSX contexts
  },
  autoIndent: [
    // Whether to indent
    ([start], value) => /[([{][^\n)\]}]*$/.test(code.slice(0, start)),
    // Whether to add an extra line
    ([start, end], value) => /\[]|\(\)|{}/.test(code[start - 1] + code[end])
  ],
  autoCloseTags([start, end, direction], value) {
    // Function called when the user types ">", intended to auto close tags.
    // If a string is returned, it will get inserted behind the cursor.
  }
}
```

## Avoiding layout shifts

Adding an editor in the middle of your page will cause layout shifts. This is bad for UX and should ideally be mitigated. One way is to reserve space for the editor by giving its container a fixed height or a grid layout. This works well enough for editors with vertical scrolling.

A second solution is to have a placeholder element which gets replaced by your editor. This is the ideal solution for read-only code examples where you want `height: auto` instead of a vertical scroll bar. To make this easier, there's a wrapper around `createEditor` intended for exactly this which replaces your element instead of appending the editor to it. The placeholder element's `textContent` will be used as the editor's code unless `options.value` is defined.

```javascript
import { editorFromPlaceholder } from "prism-code-editor"

const editor = editorFromPlaceholder("#editor", { language: "javascript" })
```

If you know the height of the editor, your placeholder could be as simple as a div with a fixed height. If not, the placeholder element should have a very similar layout to the editor, i.e., same `padding`, `font-size`, `font-family`, `white-space`, `line-height`. How this achieved doesn't matter, but a solution is to use similar markup to the editor itself. [Here's an example](https://stackblitz.com/edit/vitejs-vite-sbvab7?file=index.html,src%2Fstyle.css,src%2Fmain.ts,readme.md) of this.

## Tooltips

There's a utility to display tooltips above or below the cursor that can be imported from `prism-code-editor/tooltips`.

```typescript
const addTooltip = (editor: PrismEditor, element: HTMLElement, fixedWidth?: boolean): [ShowTooltip, HideTooltip]

const [show, hide] = addTooltip(editor, element)
```

If you want the tooltip to always be visible when the user scrolls horizontally, add `position: sticky` along with the `left` and/or `right` CSS properties to your tooltip.

## Overscroll

```javascript
import { addOverscroll, removeOverscroll } from "prism-code-editor/tooltips"

addOverscroll(editor)
```

This will allow users to scroll until the last line is at the top of the editor.

## RTL Support

RTL support is disabled by default. To enable it, you need to import an extra stylesheet, only then will the `rtl` option do something.

```javascript
import "prism-code-editor/rtl-layout.css"
```

RTL support is currently experimental due to multiple browser bugs being present:

- In Chrome and Safari, the line number background won't stick when scrolling. The line numbers themselves are given a background to compensate, but this isn't perfect.
- In Firefox, the first tab character on a line will sometimes be incorrectly sized.
- In Safari, absolutely positioned elements inside lines can change the order of characters when mixing RTL and LTR text and tab characters are super buggy.

If you want to use RTL directionality, you should be aware of these bugs and use spaces instead of tabs for indenting.

## Editing key commands

Editing key commands is as simple as mutating the `keyCommandMap` for the editor. If you're adding the default commands to the editor, be sure to mutate the command map after adding that extension.

```javascript
// Adding a Ctrl+Alt shortcut without removing the default enter functionality
const oldEnterCallback = editor.keyCommandMap.Enter

editor.keyCommandMap.Enter = (e, selection, value) => {
  if (e.altKey) {
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

The library includes a custom element wrapper for each of the 4 setups you can import.

```typescript
import { addBasicEditor, PrismEditorElement } from "prism-code-editor/web-component"

// Adds a web component with the specified name
addBasicEditor("prism-editor")

const editorElement = document.querySelector<PrismEditorElement>("prism-editor")

// Add a listener for when the editor finishes loading
editorElement.addEventListener("ready", () => console.log("ready"))

// The editor can be accessed from the element
console.log(editorElement.editor)
```

Attributes include `language`, `theme`, `tab-size`, `line-numbers`, `word-wrap`, `readonly`, `insert-spaces` and `rtl`. These attributes are also writable properties on the element.

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

## Performance

All the code is tokenized each time for simplicity's sake. Even though only lines that change are updated in the DOM, the editor slows down as more code is added, although not as quickly as with zero optimizations.

Once you start approaching 1000 LOC, the editor will start slowing down on most hardware. If you need to display that much code, consider a more robust/heavy library.

## Compatibility

This has been tested to work in the latest desktop and mobile versions of both Safari, Chrome, and Firefox. It should work in slightly older browsers too, but there will be many bugs present in browsers that don't support `beforeinput` events.

This library does not support any Prism plugins since Prism hooks have been removed. Behavior like the [Highlight Keywords](https://prismjs.com/plugins/highlight-keywords/) plugin is included.

Some grammars have had small changes, most notably markup tags' grammar. So Prism themes will work to style the tokens, but there can be some slight differences.

PrismJS automatically adds the global regex flag to the pattern of greedy tokens. This has been removed, so if you're using your own Prism grammars, you might have to add the global flag to the greedy tokens. 

## Credits

This library is made possible thanks to [Prism](https://prismjs.com).

## Contributing

Feature requests, bug reports, optimizations and potentially new themes and extensions are all welcome.

To test your changes during development, install dependencies:

    cd package
    pnpm install

And run the development server:

    pnpm run dev
