// Prism's identifier-test with minor changes
// https://github.com/PrismJS/prism/blob/v1.29.0/tests/identifier-test.js

import { assert } from 'chai';
import { loadLanguages } from './helper/prism-loader.js';
import { prettyprint } from './helper/token-stream-transformer.js';
import { optionals } from './helper/lang-info.js';
import { languages, tokenizeText } from '../core.js';

// This is where you can exclude a language from the identifier test.
//
// To exclude a language to the `testOptions` variable and add your language and the identifier types it should
// excluded from. All languages opt-in for all identifier types by default, so you have to explicitly disable each type
// you want to disable by setting it to `false`.
// Also add a small comment explaining why the language was excluded.
//
// The actual identifiers for all identifier types are defined in the `identifiers` variable.

/**
 * @type {Partial<Record<keyof import("./components.json"), IdentifierTestOptions>>}
 *
 * @typedef IdentifierTestOptions
 * @property {boolean} [word=true]
 * @property {boolean} [number=true]
 * @property {boolean} [template=true]
 */
const testOptions = {
	'false': {
		word: false
	},
	// Hoon uses _ in its keywords
	'hoon': {
		word: false
	},

	// LilyPond doesn't tokenize based on words
	'lilypond': {
		word: false,
		number: false
	},

	// Nevod uses underscore symbol as operator and allows hyphen to be part of identifier
	'nevod': {
		word: false
	},

	// METAFONT has a special scheme for variable names with tags, suffixes and subscripts
	'metafont': {
		word: false
	},
};

/** @type {Record<keyof IdentifierTestOptions, string[]>} */
const identifiers = {
	word: [
		'abc',
		'word',
		'foo1',
		'foo123',
		'foo123bar',
		'foo_123',
		'foo_123_bar',
	],
	number: [
		'0',
		'1',
		'9',
		'123',
		'123456789',
	],
};


// Below is the implementation of the test.
// If you only came here to exclude a language, you won't find anything below.
for (const lang in optionals) {
	describe(`Test '${lang}'`, () => {
		testLiterals([lang]);
	});

	const optional = optionals[lang];

	if (optional.length) {
		describe(`Patterns of '${lang}' with optional dependencies`, () => {
			testLiterals(([lang, ...optional]));
		});
	}

}

/**
 * @param {string} lang
 * @returns {IdentifierTestOptions}
 */
function getOptions(lang) {
	return testOptions[lang] || {};
}

/**
 * @param {string | Token | (string | Token)[]} token
 * @returns {boolean}
 *
 * @typedef Token
 * @property {string} type
 * @property {string | Token | (string | Token)[]} content
 */
function isNotBroken(token) {
	if (typeof token === 'string') {
		return true;
	} else if (Array.isArray(token)) {
		return token.length === 1 && isNotBroken(token[0]);
	} else {
		return isNotBroken(token.content);
	}
}

/**
 * Tests all patterns in the given Prism instance.
 * @param {string[]} langs
 */
async function testLiterals(langs) {

	const lang = langs[0];

	/**
	 * @param {string[]} identifierElements
	 * @param {keyof IdentifierTestOptions} identifierType
	 */
	async function matchNotBroken(identifierElements, identifierType) {
		await loadLanguages(langs);

		const grammar = languages[lang];
		if (!grammar) {
			return;
		}

		for (const ident of identifierElements) {
			const tokens = tokenizeText(ident, grammar);

			if (!isNotBroken(tokens)) {
				assert.fail(
					`${lang}: Failed to tokenize the ${identifierType} '${ident}' as one or no token.\n` +
					'Actual token stream:\n\n' +
					prettyprint(tokens) +
					'\n\n' +
					'How to fix this:\n' +
					'If your language failed any of the identifier tests then some patterns in your language can break identifiers. ' +
					'An identifier is broken if it is split into two different token (e.g. the identifier \'foo123\' (this could be a variable name) but \'123\' is tokenized as a number). ' +
					'This is usually a bug and means that some patterns need more boundary checking.\n' +
					'This test defines an identifier as /[A-Za-z_][A-Za-z_0-9]*/ so you can use \\b boundary assertions.\n\n' +
					'If the syntactic concept of an identifier is not applicable to your language, you can exclude your language from this test (or parts of it). ' +
					'Open \'' + import.meta.url + '\' and follow the instructions to exclude a language. ' +
					'(This is usually not what you should do. Only very few language do not have the concept of identifiers.)'
				);
			}
		}
	}

	const options = getOptions(lang);
	for (const identifierType in identifiers) {
		const element = identifiers[identifierType];
		if (options[identifierType] !== false) {
			it(`- should not break ${identifierType} identifiers`, async () => {
				await matchNotBroken(element, identifierType);
			});
		}
	}
}
