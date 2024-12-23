import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import dts from "vite-plugin-dts"
import fs from "node:fs/promises"

const entries: Record<string, string> = {
	index: "src/index.ts",
	"extensions/guides": "src/extensions/guides.tsx",
	"extensions/commands": "src/extensions/commands.ts",
	"extensions/cursor": "src/extensions/cursor.ts",
	"extensions/match-brackets/index": "src/extensions/match-brackets/index.ts",
	"extensions/match-brackets/highlight": "src/extensions/match-brackets/highlight.ts",
	"extensions/match-tags": "src/extensions/match-tags.ts",
	"extensions/search/index": "src/extensions/search/index.ts",
	search: "src/extensions/search/search.css",
	copy: "src/extensions/copy-button/copy.css",
	"extensions/copy-button/index": "src/extensions/copy-button/index.ts",
	"extensions/folding/index": "src/extensions/folding/index.ts",
	"extensions/overscroll": "src/extensions/overscroll.ts",
	folding: "src/extensions/folding/folding.css",
	setups: "src/setups.tsx",
	tooltips: "src/tooltips.ts",
	scrollbar: "src/scrollbar.css",
	"rtl-layout": "src/rtl-layout.css",
	layout: "src/layout.css",
	"themes/index": "src/themes/index.ts",
	"utils/index": "src/utils/index.ts",
	"prism/index": "src/prism/index.js",
	"prism/utils": "src/prism/utils.js",
}

await Promise.all([
	fs.readdir(new URL("./src/prism/languages", import.meta.url)).then(files =>
		files.forEach(name => {
			entries["prism/languages/" + name.slice(0, -3)] = "src/prism/languages/" + name
		}),
	),
	fs.readdir(new URL("./src/themes", import.meta.url)).then(files =>
		files.forEach(name => {
			if (name.slice(-4) == ".css") {
				entries["themes/" + name.slice(0, -4)] = "src/themes/" + name
			}
		}),
	),
	fs.readdir(new URL("./src/languages", import.meta.url)).then(files =>
		files.forEach(name => {
			if (name.slice(-3) == ".ts") {
				entries["languages/" + name.slice(0, -3)] = "src/languages/" + name
			}
		}),
	),
])

export default defineConfig({
	plugins: [
		/* 
    Uncomment the following line to enable solid-devtools.
    For more info see https://github.com/thetarnav/solid-devtools/tree/main/packages/extension#readme
    */
		// devtools(),
		react(),
		dts({
			beforeWriteFile(filePath) {
				if (filePath.includes("languages/shared")) {
					return false
				}
			},
		}),
	],
	build: {
		cssCodeSplit: true,
		sourcemap: true,
		cssMinify: "esbuild",
		minify: false,
		rollupOptions: {
			external: ["react", "react-dom", "react/jsx-runtime"],
			output: {
				banner({ fileName, isEntry }) {
					if (!isEntry) return ""
					// if (fileName.slice(0, 9) == "languages") return ""
					// if (exports.length == 0) return ""
					if (fileName.slice(0, 5) == "prism") return ""
					if (fileName.slice(0, 5) == "theme") return ""
					return '"use client";'
				}
			}
		},
		lib: {
			entry: entries,
			formats: ["es"],
		},
		target: ["es2021", "safari14"],
	},
})
