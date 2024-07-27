export const startCode = `<body>
  <style>
    
  </style>
  <script>
    
  </script>
</body>`,

startOptions = `const code = '${startCode.replace(/\n/g, '\\n')}'

// Languages available in this example include:
// javascript, html, css, markdown, xml, jsx, python, typescript and tsx

const options = {
  language: 'html',
  insertSpaces: true,
  tabSize: 2,
  lineNumbers: true,
  readOnly: false,
  wordWrap: false,
  value: code,
  rtl: false,
  onUpdate(code) {},
  onSelectionChange([start, end, direction], code) {},
  onTokenize(tokens, language, code) {}
}`,

basicUsage = `import {
  minimalEditor, basicEditor,
  fullEditor, readonlyEditor
} from "prism-code-editor/setups"
import "prism-code-editor/prism/languages/javascript"

const editor = basicEditor(
  "#editor",
  {
    language: "javascript",
    theme: "github-dark"
  },
  () => console.log("ready")
)`
