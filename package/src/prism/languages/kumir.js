import { languages } from '../core.js';
import { re } from '../utils/shared.js';

/** Regular expression for characters that are not allowed in identifiers. */
var nonId = '\\s\0-\x1f\x22-/\x3a-\x3f\[-\x5e\x60\x7b-\x7e';

/**
 * Surround a regular expression for IDs with patterns for non-ID sequences.
 *
 * @param {string} pattern A regular expression for identifiers.
 * @param {string} [flags] The regular expression flags.
 * @returns {RegExp} A wrapped regular expression for identifiers.
 */
var wrapId = (pattern, flags) => re(pattern, [nonId], flags);

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
		pattern: wrapId(/(^|[<0>])(?:да|нет)(?=[<0>]|$)/.source),
		lookbehind: true
	},

	'operator-word': {
		pattern: wrapId(/(^|[<0>])(?:и|или|не)(?=[<0>]|$)/.source),
		lookbehind: true,
		alias: 'keyword'
	},

	'system-variable': {
		pattern: wrapId(/(^|[<0>])знач(?=[<0>]|$)/.source),
		lookbehind: true,
		alias: 'keyword'
	},

	'type': [
		{
			pattern: wrapId(/(^|[<0>])(?:вещ|лит|лог|сим|цел)(?: *таб)?(?=[<0>]|$)/.source),
			lookbehind: true,
			alias: 'builtin'
		},
		{
			pattern: wrapId(/(^|[<0>])(?:компл|сканкод|файл|цвет)(?=[<0>]|$)/.source),
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
		pattern: wrapId(/(^|[<0>])(?:алг|арг(?: *рез)?|ввод|ВКЛЮЧИТЬ|вс[её]|выбор|вывод|выход|дано|для|до|дс|если|иначе|исп|использовать|кон(?:(?: +|_)исп)?|кц(?:(?: +|_)при)?|надо|нач|нс|нц|от|пауза|пока|при|раза?|рез|стоп|таб|то|утв|шаг)(?=[<0>]|$)/.source),
		lookbehind: true
	},

	/** Should be performed after searching for reserved words. */
	'name': {
		// eslint-disable-next-line regexp/no-super-linear-backtracking
		pattern: wrapId(/(^|[<0>])[^\d<0>][^<0>]*(?: +[^<0>]+)*(?=[<0>]|$)/.source),
		lookbehind: true
	},

	/** Should be performed after searching for names. */
	'number': {
		pattern: wrapId(/(^|[<0>])(?:\B\$[a-f\d]+\b|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[+-]?\d+)?)(?=[<0>]|$)/.source, 'i'),
		lookbehind: true
	},

	/** Should be performed after searching for words. */
	'punctuation': /:=|[()[\],:;]/,

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
