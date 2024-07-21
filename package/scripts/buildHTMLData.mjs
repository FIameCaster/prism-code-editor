import fs from "node:fs/promises"

/**
 * @typedef HTMLData
 * @property {number} version
 * @property {HTMLTag[]} tags
 * @property {Attribute[]} globalAttributes
 * @property {ValueSet[]} valueSets
 *
 * @typedef HTMLTag
 * @property {string} name
 * @property {Attribute[]} attributes
 *
 * @typedef Attribute
 * @property {string} name
 * @property {string | undefined} valueSet
 *
 * @typedef ValueSet
 * @property {string} name
 * @property {AttrValue[]} values
 *
 * @typedef AttrValue
 * @property {string} name
 */

/** @type {HTMLData} */
const data = JSON.parse(
	await fs.readFile("./node_modules/@vscode/web-custom-data/data/browsers.html-data.json", {
		encoding: "utf-8",
	}),
)

/** @type {Set<string>} */
const usedValueSets = new Set()

/** @param {string} name */
const getAttrVariable = name => {
	if (!name || name == "v") return "0"
	usedValueSets.add(name)
	return "attrValue" + name[0].toUpperCase() + name.slice(1)
}

/** @param {string} name */
const getPropName = name => {
	return name.includes("-") ? `"${name}"` : name
}

const lines = [
	"// generated from @vscode/web-custom-data package",
	"",
	'import { HTMLAttributes, HTMLTags } from "../types"',
	"",
	"",
	"const globalAttributes: HTMLAttributes = {",
]

const globals = new Set()

data.globalAttributes.forEach(attr => {
	if (globals.has(attr.name)) return
	globals.add(attr.name)
	lines.push(`\t${getPropName(attr.name)}: ${getAttrVariable(attr.valueSet)},`)
})

lines.push("}", "", "const tags: HTMLTags = {")

data.tags.forEach(tag => {
	const attrs = tag.attributes
	if (!attrs.length) lines.push(`\t${tag.name}: {},`)
	else {
		lines.push(`\t${tag.name}: {`)
		const seen = new Set()
		attrs.forEach(attr => {
			if (seen.has(attr.name) || globals.has(attr.name)) return
			seen.add(attr.name)
			lines.push(`\t\t${getPropName(attr.name)}: ${getAttrVariable(attr.valueSet)},`)
		})
		lines.push("\t},")
	}
})

lines.push("}", "", "export { globalAttributes, tags }", "")

const valueSets = []

data.valueSets.forEach((valueSet, i) => {
	if (usedValueSets.has(valueSet.name)) {
		let line = `const ${getAttrVariable(valueSet.name)} = [`
		let hasBools = !!valueSet.values.find(value => value.name == "true")

		if (hasBools) line += '"true", "false"'

		valueSet.values.forEach(({ name }, i) => {
			if (name == "true" || name == "false") return
			if (i || hasBools) line += ", "
			line += `"${name}"`
		})
		valueSets.push(line + "]")
	}
})

lines.splice(4, 0, ...valueSets)

fs.writeFile("./src/extensions/autocomplete/html/data.ts", lines.join("\r\n"))
