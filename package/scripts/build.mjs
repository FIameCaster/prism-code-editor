import * as fs from "node:fs"

const themes = [
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
]

const logError = err => err && console.log(err)

for (const theme of themes) {
	fs.rename(`dist/${theme}.css`, `dist/themes/${theme}.css`, logError)
}

let themeMod = fs.readFileSync("dist/themes/index.js", "utf-8")
const regex = RegExp(`(${themes.join("|")})(-[0-9a-f]+)\.js`)
const entries = await fs.promises.readdir("dist", { withFileTypes: true })

for (const entry of entries) {
	const match = entry.name.match(regex)
	if (match) {
		themeMod = themeMod.replace(match[2], "")
		fs.rename(`dist/${entry.name}`, `dist/${match[1]}.js`, logError)
	}
}

fs.writeFile("dist/themes/index.js", themeMod, logError)

const { exports } = JSON.parse(fs.readFileSync("package.json", "utf-8"))

const writePackageJson = (main, types, path) => {
	fs.mkdir(path, { recursive: true }, err => {
		if (err) console.log(err)
		else {
			fs.writeFile(
				path + "/package.json",
				`{
	"internal": true,
	"main": "${main}",${
					types
						? `
	"types": "${types}",`
						: ""
				}
	"type": "module"
}`,
				logError,
			)
		}
	})
}

for (const path in exports) {
	if (/\.(css)?$/.test(path)) continue
	if (/\*$/.test(path)) {
		const entries = await fs.promises.readdir("./dist" + path.slice(1, -2), {
			withFileTypes: false,
		})
		for (const entry of new Set(entries.map(e => e.split(".")[0])))
			if (entry != "index") {
				writePackageJson(
					exports[path].default.replace("*", entry),
					exports[path].types?.replace("*", entry),
					path.slice(0, -1) + entry,
				)
			}
	} else writePackageJson(exports[path].default, exports[path].types, path)
}

fs.copyFile("../readme.md", "readme.md", logError)
fs.copyFile('../LICENSE', 'LICENSE', logError)
