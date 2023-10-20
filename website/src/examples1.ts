export const startCode = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Prism code editor</title>
  <script src="prism.js" data-manual></script>
  <link rel="stylesheet" href="src/style.css">
  <style>
    
  </style>
</head>
<body>
  <script>
    
  </script>
</body>
</html>`,

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
  onTokenize({ language, code, grammar, tokens }) {}
}`,

basicUsage = `import {
  minimalEditor, basicEditor,
  fullEditor, readonlyEditor
} from "prism-code-editor/setups"
import "prism-code-editor/grammars/javascript"

const editor = basicEditor(
  "#editor",
  {
    language: "javascript",
    theme: "github-dark"
  },
  () => console.log("ready")
)`
