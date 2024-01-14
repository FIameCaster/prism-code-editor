import { languages, rest, tokenize, tokenizeText, withoutTokenizer, Token } from "../../core.js"
import { clikeComment, clikeString } from "../../utils/shared.js"
import { embeddedIn } from "../../utils/templating.js"
import { createT4 } from "../../utils/t4-templating.js"
import { clone, extend, insertBefore } from "../../utils/language.js"
import dependencyMap from "../dependencies.json" assert { "type": "json" }
import path from "path"
import fs from "fs"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const languageDir = path.join(__dirname, "../../languages")

/** @type {Map<string, Function>} */
const cache = new Map()

const imports = {
	languages,
	rest,
	tokenize,
	Token,
	tokenizeText,
	withoutTokenizer,
	clikeComment,
	clikeString,
	embeddedIn,
	createT4,
	clone,
	extend,
	insertBefore,
}

const args = Object.keys(imports)
const values = Object.values(imports)

const initialLangs = Object.keys(languages)

/**
 * @param {string} name
 * @returns {Function}
 */
const getComponent = async name => {
	if (cache.has(name)) return cache.get(name)
	const file = await fs.promises.readFile(path.join(languageDir, name + ".js"), {
		encoding: "utf-8",
	})
	const importEnd = file.search(/\n\n|\r\n?\r\n?/)
	const compoenent = new Function(...args, file.slice(importEnd))
	cache.set(name, compoenent)
	return compoenent
}

/** @param {string[]} langs */
const loadLanguages = async langs => {
	for (const key in languages) {
		if (!initialLangs.includes(key)) delete languages[key]
	}

	/** @type {string[]} */
	const allLanguages = []
	for (const lang of langs) {
		/** @type {string[]} */
		const deps = dependencyMap[lang]
		if (deps) allLanguages.push(...deps, lang)
	}

	const compoenents = await Promise.all([...new Set(allLanguages)].map(getComponent))
	compoenents.forEach(compoenent => compoenent(...values))
}

export { loadLanguages }
