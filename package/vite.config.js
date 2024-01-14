import { defineConfig } from "vite"
import dts from "vite-plugin-dts"
import dependencyMap from "./src/prism/tests/dependencies.json" assert { "type": "json" }

const entries = {
	index: "src/index.ts",
	"extensions/guides": "src/extensions/guides.ts",
	"extensions/commands": "src/extensions/commands.ts",
	"extensions/cursor": "src/extensions/cursor.ts",
	"setups/index": "src/setups/index.ts",
	webComponent: "src/webComponent.ts",
	"extensions/matchBrackets/index": "src/extensions/matchBrackets/index.ts",
	"extensions/matchBrackets/highlight": "src/extensions/matchBrackets/highlight.ts",
	"extensions/matchTags": "src/extensions/matchTags.ts",
	"extensions/search/index": "src/extensions/search/index.ts",
	"extensions/search/api": "src/extensions/search/api.ts",
	search: "src/extensions/search/search.css",
	copy: "src/extensions/copyButton/copy.css",
	"extensions/copyButton/index": "src/extensions/copyButton/index.ts",
	"extensions/folding/index": "src/extensions/folding/index.ts",
	folding: "src/extensions/folding/folding.css",
	tooltips: "src/tooltips.ts",
	scrollbar: "src/scrollbar.css",
	"rtl-layout": "src/rtl-layout.css",
	layout: "src/layout.css",
	"themes/index": "src/themes/index.ts",
	utils: "src/utilsExport.ts",
	'prism/index': "src/prism/index.ts",
	"prism/utils/index": "src/prism/utils/index.ts",
}

for (const name in dependencyMap) 
	entries[`prism/languages/${name}`] = `src/prism/languages/${name}.js`

for (const theme of [
	"atom-one-dark",
	"dracula",
	"github-dark-dimmed",
	"github-dark",
	"github-light",
	"night-owl",
	"prism-okaidia",
	"prism-solarized-light",
	"prism-twilight",
	"prism",
	"vs-code-dark",
	"vs-code-light",
])
	entries[theme] = `src/themes/${theme}.css`

for (const lang of ["clike", "css", "html", "jsx", "python", "xml", "index"])
	entries["languages/" + lang] = `src/languages/${lang}.ts`

export default defineConfig({
	build: {
		cssCodeSplit: true,
		sourcemap: true,
		lib: {
			entry: entries,
			formats: ["es"],
		},
		target: ["es2020", "safari14"],
	},
	plugins: [dts()],
})
