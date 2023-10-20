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

fs.copyFile("../readme.md", "readme.md", logError)
fs.copyFile("../LICENSE", "LICENSE", logError)

const utils = fs.readFileSync("dist/utils.d.ts", "utf-8")
fs.writeFile("dist/utils.d.ts", utils.replace(", scrollToEl", ""), logError)
