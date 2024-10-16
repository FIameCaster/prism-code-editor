export const options = `const options = {
	editorsOnly: false,
	defaultEditorProps: {
		tokenizeCallback: rainbowBrackets(),
	},
	defaultCodeBlockProps: {
		tokenizeCallback: rainbowBrackets(),
		guideIndents: true,
		lineNumbers: true,
	}
}
`

export const markdown = `## Test

\`\`\`js editor
const foo = "bar"
\`\`\`

\`\`\`css
div.foo {
	display: flex;
	align-items: center;
}
\`\`\`
`