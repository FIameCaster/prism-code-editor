import { languages, rest, tokenize, tokenizeText, withoutTokenizer, Token } from "../../core.js"
import { clikeComment, clikeString } from "../../utils/shared.js"
import { embeddedIn } from "../../utils/templating.js"
import { createT4 } from "../../utils/t4-templating.js"
import { clone, extend, insertBefore } from "../../utils/language.js"
import { dependencyGraph } from "./lang-info.js"
import fs from "fs"

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
	const file = await fs.promises.readFile(new URL(`../../languages/${name}.js`, import.meta.url), {
		encoding: "utf-8",
	})
	const importEnd = file.search(/\n\n|\r\n?\r\n?/)
	const compoenent = new Function(...args, file.slice(importEnd))
	cache.set(name, compoenent)
	return compoenent
}

/** @param {string[]} langs */
const loadLanguages = async langs => {
	/** @type {string[]} */
	const allLanguages = []
	for (const lang of langs) {
		const deps = dependencyGraph[lang]
		if (deps) allLanguages.push(...deps, lang)
	}

	const components = await Promise.all([...new Set(allLanguages)].map(getComponent))

	for (const key in languages) {
		if (!initialLangs.includes(key)) delete languages[key]
	}
	components.forEach(component => component(...values))
}

export { loadLanguages }
