import fs from "node:fs/promises"

const files = (await fs.readdir(new URL("../src/prism/languages", import.meta.url))).filter(
	name => name != "common.js" && name != "index.js",
)

/** @type {Record<string, string[]>} */
const depsMap = {}

Promise.all(
	files.map(async file => {
		const name = file.slice(0, -3)
		depsMap[name] = []
		const code = await fs.readFile(new URL("../src/prism/languages/" + file, import.meta.url), {
			encoding: "utf-8",
		})
		depsMap[name] = (code.match(/import '\.\/[^.]+\.js';/g) || []).map(str => str.slice(10, -5))
	}),
).then(() => {
	/** @type {string} */
	const lines = []

	/**
	 * @param {string} fileName
	 * @param {Set<string>} deps
	 */
	const addDeps = (fileName, deps) => {
		for (const dep of depsMap[fileName]) {
			if (!deps.has(dep)) {
				addDeps(dep, deps)
				deps.add(dep)
			}
		}
		return deps
	}

	for (const file in depsMap) {
		const arr = []
		for (const dep of addDeps(file, new Set())) {
			arr.push(`"${dep}"`)
		}
		lines.push(`\t"${file}": [${arr.join(", ")}]`)
	}

	fs.writeFile(
		new URL("../src/prism/tests/dependencies.json", import.meta.url),
		`{\n${lines.join(",\n")}\n}\n`,
	)
})
