import { languages } from '../core.js';

/**
 * Regular expression for characters that are not allowed in identifiers.
 *
 * @type {string}
 */
var nonId = /\s\0-\x1f\x22-\/\x3a-\x3f\[-\x5e\x60\x7b-\x7e/.source;

/**
 * Surround a regular expression for IDs with patterns for non-ID sequences.
 *
 * @param {RegExp} pattern A regular expression for identifiers.
 * @param {string} [flags] The regular expression flags.
 * @returns {RegExp} A wrapped regular expression for identifiers.
 */
var wrapId = (pattern, flags) =>
	RegExp(pattern.source.replace(/<nonId>/g, nonId), flags);

languages.kum = languages.kumir = {
	'comment': /\|.*/,

	'prolog': {
		pattern: /#.*/g,
		greedy: true
	},

	'string': {
		pattern: /"[^\n"]*"|'[^\n']*'/g,
		greedy: true
	},

	'boolean': {
		pattern: wrapId(/(^|[<nonId>])(?:да|нет)(?=[<nonId>]|$)/),
		lookbehind: true
	},

	'operator-word': {
		pattern: wrapId(/(^|[<nonId>])(?:и|или|не)(?=[<nonId>]|$)/),
		lookbehind: true,
		alias: 'keyword'
	},

	'system-variable': {
		pattern: wrapId(/(^|[<nonId>])знач(?=[<nonId>]|$)/),
		lookbehind: true,
		alias: 'keyword'
	},

	'type': [
		{
			pattern: wrapId(/(^|[<nonId>])(?:вещ|лит|лог|сим|цел)(?: *таб)?(?=[<nonId>]|$)/),
			lookbehind: true,
			alias: 'builtin'
		},
		{
			pattern: wrapId(/(^|[<nonId>])(?:компл|сканкод|файл|цвет)(?=[<nonId>]|$)/),
			lookbehind: true,
			alias: 'important'
		}
	],

	/**
	 * Should be performed after searching for type names because of "таб".
	 * "таб" is a reserved word, but never used without a preceding type name.
	 * "НАЗНАЧИТЬ", "Фввод", and "Фвывод" are not reserved words.
	 */
	'keyword': {
		pattern: wrapId(/(^|[<nonId>])(?:алг|арг(?: *рез)?|ввод|ВКЛЮЧИТЬ|вс[её]|выбор|вывод|выход|дано|для|до|дс|если|иначе|исп|использовать|кон(?:(?: +|_)исп)?|кц(?:(?: +|_)при)?|надо|нач|нс|нц|от|пауза|пока|при|раза?|рез|стоп|таб|то|утв|шаг)(?=[<nonId>]|$)/),
		lookbehind: true
	},

	/** Should be performed after searching for reserved words. */
	'name': {
		// eslint-disable-next-line regexp/no-super-linear-backtracking
		pattern: wrapId(/(^|[<nonId>])[^\d<nonId>][^<nonId>]*(?: +[^<nonId>]+)*(?=[<nonId>]|$)/),
		lookbehind: true
	},

	/** Should be performed after searching for names. */
	'number': {
		pattern: wrapId(/(^|[<nonId>])(?:\B\$[\da-f]+\b|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[+-]?\d+)?)(?=[<nonId>]|$)/, 'i'),
		lookbehind: true
	},

	/** Should be performed after searching for words. */
	'punctuation': /:=|[(),:;[\]]/,

	/**
	 * Should be performed after searching for
	 * - numeric constants (because of "+" and "-");
	 * - punctuation marks (because of ":=" and "=").
	 */
	'operator-char': {
		pattern: /\*\*?|<[=>]?|>=?|[-+/=]/,
		alias: 'operator'
	}
};
