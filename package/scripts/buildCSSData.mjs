import * as fs from "node:fs/promises"

/**
 * @typedef CSSData
 * @property {number} version
 * @property {Property[]} properties
 * @property {{ name: string }[]} atDirectives
 * @property {{ name: string }[]} pseudoClasses
 * @property {{ name: string }[]} pseudoElements
 *
 * @typedef Property
 * @property {string} name
 * @property {string} syntax
 * @property {{ name: string }[]?} values
 * @property {number} relevance
 */

/** @type {CSSData} */
const data = JSON.parse(
	await fs.readFile("./node_modules/@vscode/web-custom-data/data/browsers.css-data.json", {
		encoding: "utf-8",
	}),
)

const colors = [
	"aliceblue",
	"antiquewhite",
	"aqua",
	"aquamarine",
	"azure",
	"beige",
	"bisque",
	"black",
	"blanchedalmond",
	"blue",
	"blueviolet",
	"brown",
	"burlywood",
	"cadetblue",
	"chartreuse",
	"chocolate",
	"coral",
	"cornflowerblue",
	"cornsilk",
	"crimson",
	"cyan",
	"darkblue",
	"darkcyan",
	"darkgoldenrod",
	"darkgray",
	"darkgreen",
	"darkgrey",
	"darkkhaki",
	"darkmagenta",
	"darkolivegreen",
	"darkorange",
	"darkorchid",
	"darkred",
	"darksalmon",
	"darkseagreen",
	"darkslateblue",
	"darkslategray",
	"darkslategrey",
	"darkturquoise",
	"darkviolet",
	"deeppink",
	"deepskyblue",
	"dimgray",
	"dimgrey",
	"dodgerblue",
	"firebrick",
	"floralwhite",
	"forestgreen",
	"fuchsia",
	"gainsboro",
	"ghostwhite",
	"gold",
	"goldenrod",
	"gray",
	"green",
	"greenyellow",
	"grey",
	"honeydew",
	"hotpink",
	"indianred",
	"indigo",
	"ivory",
	"khaki",
	"lavender",
	"lavenderblush",
	"lawngreen",
	"lemonchiffon",
	"lightblue",
	"lightcoral",
	"lightcyan",
	"lightgoldenrodyellow",
	"lightgray",
	"lightgreen",
	"lightgrey",
	"lightpink",
	"lightsalmon",
	"lightseagreen",
	"lightskyblue",
	"lightslategray",
	"lightslategrey",
	"lightsteelblue",
	"lightyellow",
	"lime",
	"limegreen",
	"linen",
	"magenta",
	"maroon",
	"mediumaquamarine",
	"mediumblue",
	"mediumorchid",
	"mediumpurple",
	"mediumseagreen",
	"mediumslateblue",
	"mediumspringgreen",
	"mediumturquoise",
	"mediumvioletred",
	"midnightblue",
	"mintcream",
	"mistyrose",
	"moccasin",
	"navajowhite",
	"navy",
	"oldlace",
	"olive",
	"olivedrab",
	"orange",
	"orangered",
	"orchid",
	"palegoldenrod",
	"palegreen",
	"paleturquoise",
	"palevioletred",
	"papayawhip",
	"peachpuff",
	"peru",
	"pink",
	"plum",
	"powderblue",
	"purple",
	"rebeccapurple",
	"red",
	"rosybrown",
	"royalblue",
	"saddlebrown",
	"salmon",
	"sandybrown",
	"seagreen",
	"seashell",
	"sienna",
	"silver",
	"skyblue",
	"slateblue",
	"slategray",
	"slategrey",
	"snow",
	"springgreen",
	"steelblue",
	"tan",
	"teal",
	"thistle",
	"tomato",
	"transparent",
	"turquoise",
	"violet",
	"wheat",
	"white",
	"whitesmoke",
	"yellow",
	"yellowgreen",
]

const cssValues = new Set(colors)

const excludedProperties = new Set(["font-family", "font-feature-settings", "unicode-range"])

cssValues.add("var")
cssValues.add("unset")
cssValues.add("initial")
cssValues.add("revert")
cssValues.add("revert-layer")
cssValues.add("pre")
cssValues.add("pre-wrap")
cssValues.add("white-space")



data.properties.forEach(({ name, values }) => {
	if (excludedProperties.has(name) || name[0] == "-") return
	values?.forEach(({ name }) => {
		if (name[0] != "-") cssValues.add(name.replace(/\([^)]*\)/g, ""))
	})
})

const lines = [
	"// generated from @vscode/web-custom-data package",
	"",
	'import { Completion } from "../types"',
	"",
	"const toCompletions = (prefix: string, values: string): Completion[] => {",
	'\treturn values.split(",").map(val => ({ label: prefix + val }))',
	"}",
	"",
]

let line = 'const cssValues = /* @__PURE__ */ toCompletions("", "'

cssValues.forEach(val => {
	line += val + ","
})

lines.push(line.slice(0, -1) + '")', "")

line = 'const atRules = /* @__PURE__ */ toCompletions("@", "'

data.atDirectives.forEach(({ name }) => {
	if (name[1] != "-") line += name.slice(1) + ","
})

lines.push(line.slice(0, -1) + '")', "")

const pseudos = new Set()

data.pseudoClasses.forEach(({ name }) => {
	if (name[1] != "-") pseudos.add(name.slice(-2) == "()" ? name.slice(1, -2) : name.slice(1))
})

line = 'const pseudoClasses = /* @__PURE__ */ toCompletions(":", "'
pseudos.forEach(pseudo => {
	line += pseudo + ","
})

lines.push(line.slice(0, -1) + '")', "")

pseudos.clear()

data.pseudoElements.forEach(({ name }) => {
	if (name[2] != "-") pseudos.add(name.slice(-2) == "()" ? name.slice(2, -2) : name.slice(2))
})

line = 'const pseudoElements = /* @__PURE__ */ toCompletions("::", "'

pseudos.forEach(pseudo => {
	line += pseudo + ","
})

lines.push(line.slice(0, -1) + '")', "")

lines.push("export { cssValues, atRules, pseudoClasses, pseudoElements }", "")

fs.writeFile("./src/extensions/autocomplete/css/data.ts", lines.join("\r\n"))
