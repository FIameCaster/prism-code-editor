import { defineConfig, Plugin } from "vite"
import MagicString from "magic-string"
import dts from "vite-plugin-dts"
import fs from "node:fs/promises"

const dependencyGraph = <Record<string, string[]>>JSON.parse(
	await fs.readFile(new URL("./src/prism/tests/dependencies.json", import.meta.url), {
		encoding: "utf-8",
	}),
)

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
	"utils/index": "src/utils/index.ts",
	"prism/index": "src/prism/index.ts",
	"prism/utils/index": "src/prism/utils/index.ts",
}

for (const name in dependencyGraph)
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

const simpleRegexMinifier: Plugin = {
	name: "simple-regex-minifier",
	renderChunk(code) {
		const str = new MagicString(code)
		str.replace(/\[\\s\\S\]/g, "[^]")

		// inline-regex-source plugin used by Prism's build system
		str.replace(
			/\/((?:[^\n\r[\\\/]|\\.|\[(?:[^\n\r\\\]]|\\.)*\])+)\/\s*\.\s*source\b/g,
			(m, source: string) => {
				// escape backslashes
				source = source.replace(/\\(.)/g, (m, g1: string) => {
					// characters like /\n/ can just be kept as "\n" instead of being escaped to "\\n"
					if (/[nrt0/]/.test(g1)) {
						return m
					}
					if ("\\" == g1) {
						return "\\\\\\\\" // escape using 4 backslashes
					}
					return "\\\\" + g1
				})
				// escape single quotes
				source = source.replace(/'/g, "\\'")
				// wrap source in single quotes
				return "'" + source + "'"
			},
		)
		return {
			code: str.toString(),
			map: str.generateMap({ hires: true }),
		}
	},
}

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
	plugins: [dts(), simpleRegexMinifier],
})
