[![Bundle size](https://img.shields.io/bundlephobia/minzip/prism-code-editor?label=size)](https://bundlephobia.com/package/prism-code-editor)
[![NPM Package](https://img.shields.io/npm/v/prism-code-editor)](https://npmjs.com/prism-code-editor)

Lightweight, extensible code editor component for the web using [Prism](https://github.com/PrismJS/prism).

Check out [the demos](https://prism-code-editor.netlify.app) and the [API Documentation](https://prism-code-editor.netlify.app/api)!

## Why?

There are multiple fully featured code editors for the web such as Monaco, Ace and CodeMirror. While these are awesome, they have a large footprint and are likely overkill for code examples, forms or small playgrounds where you won't display large documents.

## How?

This library overlays syntax highlighted code over a `<textarea>`. Libraries like [CodeFlask](https://github.com/kazzkiq/CodeFlask), [react-simple-code-editor](https://github.com/react-simple-code-editor/react-simple-code-editor) and many others have been doing this for years, but this library offers some distinct advantages:

- It patches Prism's core, so it no longer relies on global variables and strips away unneeded methods making it less than 40% the size.
- It re-exports Prism's languages that now automatically import their required dependencies and embedded languages are resolved at runtime.
- It splits the highlighted code into lines. This makes it easy to add line numbers, highlight a line and only update changed lines in the DOM for efficient updates.
- The core is light as a feather with a wide array of [extensions](#extensions) you can choose from and multiple events to listen to.

## Contents

- [Installation](#installation)
- [Basic usage](#basic-usage)
- [Advanced usage](#advanced-usage)
- [Importing Prism](#importing-prism)
- [Examples](#examples)
- [Extensions](#extensions)
  - [Importing extensions](#importing-extensions)
  - [Creating your own](#creating-your-own)
- [Styling](#styling)
  - [Importing themes](#importing-themes)
  - [Scrollbar styling](#scrollbar-styling)
  - [Advanced styling](#advanced-styling)
    - [Creating a theme](#creating-a-theme)
- [Language specific behavior](#language-specific-behavior)
  - [Adding languages](#adding-languages)
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
import "prism-code-editor/grammars/markup"

const editor = fullEditor(
  "#editor",
  {
    language: "html",
    theme: "github-dark",
  },
  () => console.log("ready"),
)
```

## Advanced usage

With little effort, you can fully customize which extensions are added and how they're loaded. This won't use a shadow root which makes the editor much easier to style and customize.

```javascript
// index.ts
import "prism-code-editor/grammars/markup"
import "prism-code-editor/grammars/css-extras"
import "prism-code-editor/grammars/js-extras"

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
  
import('./extensions')
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
import { defaultCommands } from "prism-code-editor/commands"
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
)
```

## Importing Prism

If you want access to the patched Prism core to add your own languages for example, just import it.

```javascript
import { Prism } from "prism-code-editor"
```

## Examples

- [`height: auto` without layout shifts](https://stackblitz.com/edit/vitejs-vite-sbvab7?file=index.html,src%2Fstyle.css,src%2Fmain.ts,readme.md)
- [Simple tooltip example](https://stackblitz.com/edit/vitejs-vite-z2fgpu?file=src%2Fmain.ts)
- [Formatting with Prettier](https://stackblitz.com/edit/vitejs-vite-x7tzhu?file=src%2Fmain.ts,src%2Fextensions.ts)
- [Relative line numbers](https://stackblitz.com/edit/vitejs-vite-2wytja?file=src%2Fextensions.ts,src%2Fmain.ts)
- [Usage with React](https://stackblitz.com/edit/vitejs-vite-cahjr5?file=src%2FApp.tsx)
- [Adding elements to code lines](https://stackblitz.com/edit/vitejs-vite-y5pwon?file=src%2Fmain.ts,readme.md)

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

The default commands extension includes:

- Wrapping selection in brackets/quotes
- Automatic closing of brackets, quotes, and tags
- Automatic indentation and indentation with Tab key

Along with the following commands:

- Alt+ArrowUp/Down: Move line up/down
- Shift+Alt+ArrowUp/Down: Copy line up/down
- Ctrl+Enter (Cmd+Enter on MacOS) insert blank line
- Ctrl+[ (Cmd+[ on MacOS): Outdent line
- Ctrl+] (Cmd+] on MacOS): Indent line
- Shift+Ctrl+K (Shift+Cmd+K on MacOS): Delete line
- Ctrl+/ (Cmd+/ on MacOS): Toggle comment
- Shift+Alt+A: Toggle block comment

### Importing extensions

```javascript
import { matchBrackets } from "prism-code-editor/match-brackets"
import { matchTags } from "prism-code-editor/match-tags"
import { indentGuides } from "prism-code-editor/guides"
import {
  searchWidget, highlightSelectionMatches, highlightCurrentWord
} from "prism-code-editor/search"
import { defaultCommands } from "prism-code-editor/commands"
import { cursorPosition } from "prism-code-editor/cursor"
import { copyButton } from "prism-code-editor/copy-button"
import { highlightBracketPairs } from "prism-code-editor/highlight-brackets"
import {
  readOnlycodeFolding,
  markdownFolding,
  blockCommentFolding
} from "prism-code-editor/code-folding"

// And CSS
import "prism-code-editor/search.css"
import "prism-code-editor/copy-button.css"
import "prism-code-editor/code-folding.css"
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

You can also dynamically import themes into your JavaScript. This is used by the demo website.

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

If you're not using any of the setups, the styles aren't scoped using a shadow root, which makes them easy to change. If you want to change color, background, font, line-height or similar, you can do it on `.prism-code-editor` with CSS.

Default padding is `0.75em` left/right and `0.5em` top/bottom. If you want to change it, you can use the custom property `--padding-inline` for left/right. Padding top and bottom can changed by changing the margin on `.pce-wrapper`.

#### Creating a theme

It's likely that none of the themes perfectly fit your website. A great solution is to modify one of the [included themes](https://github.com/FIameCaster/prism-code-editor/tree/main/src/themes) to better suit your website. Alternatively, you can import one of the themes and override some of the styles in your on stylesheets.

Below is some additional styling information:

- `.pce-line::before` will match a line number
- `.pce-line.active-line` matches the line with the cursor
- `.prism-code-editor::before` is the background for the line numbers
- The variable `--number-spacing` is the spacing to the right of the line numbers which defaults to `0.75em`

## Language specific behavior

If you're not using the setups, automatic indentation, toggling comments, and automatic closing of tags won't work. You'll need to import the behavior or define it yourself.

```javascript
import "prism-code-editor/languages/clike"
import "prism-code-editor/languages/html"
import "prism-code-editor/languages/css"
import "prism-code-editor/languages/xml"
import "prism-code-editor/languages/jsx"
import "prism-code-editor/languages/python"
```

The clike language will work with many languages including JavaScript, Java, C++, C# and C.

Alternatively, you can import all language behavior at the expense of your bundle size.

```javascript
import "prism-code-editor/languages"
```

It's recommended to dynamically import the language behavior since it's usually not needed before the page has loaded.

### Adding languages

```javascript
import { languageMap } from "prism-code-editor"

languageMap.whatever = {
  comments: {
    line: "//",
    block: ["/*", "*/"]
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

// Add an event for when the editor finishes loading
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

This library does not support any Prism plugins due to only running the `before-tokenize` and `after-tokenize` hooks. Behavior identical to the [Highlight Keywords](https://prismjs.com/plugins/highlight-keywords/) plugin is included.

Prism's own languages rely on global variables, so you'll have to define `window.Prism` before you can import them. Don't do this and import languages from `prism-code-editor/grammars/*` instead.

## Credits

This library is made possible thanks to [Prism](https://prismjs.com).

## Contributing

Feature requests, bug reports, optimizations and potentially new themes and extensions are all welcome.

To test your changes during development, install dependencies:

    cd package
    pnpm install

And run the development server:

    pnpm run dev
