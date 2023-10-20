const fs = require("node:fs")

// Delete src/grammars if you want to generate the languages over again

if (!fs.existsSync("src/grammars")) {
	const { languages } = require("prismjs/components")

	const logError = error => error && console.error(error)

	fs.mkdirSync("src/grammars")

	Object.keys(languages).forEach(async name => {
		if (name == "meta") return

		let deps = languages[name].require
		if (deps && !Array.isArray(deps)) deps = [deps]

		let code = await fs.promises.readFile(`node_modules/prismjs/components/prism-${name}.js`, {
			encoding: "utf-8",
		})

		let blockStart = code.indexOf("(function (Prism) {")

		if (blockStart + 1) {
			code = code.slice(blockStart + 20, code.indexOf("}(Prism));")).replace(/\n\t/g, "\n")
		}

		const result = [
			`import { Prism, languages${
				code.includes(".insertBefore") ? ", insertBefore" : ""
			} } from '../prismCore'`,
			...(deps ? deps.map(name => `import './${name}'`) : []),
			"",
			code
				.trim()
				.replace(/Prism\.languages\.insertBefore/g, "insertBefore")
				.replace(/Prism\.languages/g, "languages"),
			"",
		].join("\n")

		fs.writeFile(`src/grammars/${name}.js`, result, logError)
	})
}
