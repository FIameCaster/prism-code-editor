import { languages } from '../core.js';

var id = /(?:\B-|\b_|\b)[A-Za-z][\w-]*(?![\w-])/.source;
var type = `(?:\\b(?:unsigned\\s+)?long\\s+long(?![\\w-])|\\b(?:unrestricted|unsigned)\\s+[a-z]+(?![\\w-])|(?!(?:unrestricted|unsigned)\\b)${id}(?:\\s*<(?:[^<>]|<[^<>]*>)*>)?)(?:\\s*\\?)?`;

var typeInside = {};

languages['web-idl'] = {
	'comment': {
		pattern: /\/\/.*|\/\*[\s\S]*?\*\//,
		greedy: true
	},
	'string': {
		pattern: /"[^"]*"/,
		greedy: true
	},

	'namespace': {
		pattern: RegExp(/(\bnamespace\s+)/.source + id),
		lookbehind: true,
	},
	'class-name': [
		{
			pattern: /(^|[^\w-])(?:iterable|maplike|setlike)\s*<(?:[^<>]|<[^<>]*>)*>/,
			lookbehind: true,
			inside: typeInside
		},
		{
			pattern: RegExp(/(\b(?:attribute|const|deleter|getter|optional|setter)\s+)/.source + type),
			lookbehind: true,
			inside: typeInside
		},
		{
			// callback return type
			pattern: RegExp(`(\\bcallback\\s+${id}\\s*=\\s*)${type}`),
			lookbehind: true,
			inside: typeInside
		},
		{
			// typedef
			pattern: RegExp(/(\btypedef\b\s*)/.source + type),
			lookbehind: true,
			inside: typeInside
		},

		{
			pattern: RegExp(/(\b(?:callback|dictionary|enum|interface(?:\s+mixin)?)\s+)(?!(?:interface|mixin)\b)/.source + id),
			lookbehind: true,
		},
		{
			// inheritance
			pattern: RegExp('(:\\s*)' + id),
			lookbehind: true,
		},

		// includes and implements
		RegExp(id + '(?=\\s+(?:implements|includes)\\b)'),
		{
			pattern: RegExp('(\\b(?:implements|includes)\\s+)' + id),
			lookbehind: true,
		},

		{
			// function return type, parameter types, and dictionary members
			pattern: RegExp(`${type}(?=\\s*(?:\\.{3}\\s*)?${id}\\s*[(),;=])`),
			inside: typeInside
		},
	],

	'builtin': /\b(?:ArrayBuffer|BigInt64Array|BigUint64Array|ByteString|DOMString|DataView|Float32Array|Float64Array|FrozenArray|Int16Array|Int32Array|Int8Array|ObservableArray|Promise|USVString|Uint16Array|Uint32Array|Uint8Array|Uint8ClampedArray)\b/,
	'keyword': [
		/\b(?:async|attribute|callback|const|constructor|deleter|dictionary|enum|getter|implements|includes|inherit|interface|mixin|namespace|null|optional|or|partial|readonly|required|setter|static|stringifier|typedef|unrestricted)\b/,
		// type keywords
		/\b(?:any|bigint|boolean|byte|double|float|iterable|long|maplike|object|octet|record|sequence|setlike|short|symbol|undefined|unsigned|void)\b/
	],
	'boolean': /\b(?:false|true)\b/,

	'number': {
		pattern: /(^|[^\w-])-?(?:0x[0-9a-f]+|(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?|NaN|Infinity)(?![\w-])/i,
		lookbehind: true
	},
	'operator': /\.{3}|[=:?<>-]/,
	'punctuation': /[(){}[\].,;]/
};

for (var key in languages['web-idl']) {
	if (key !== 'class-name') {
		typeInside[key] = languages['web-idl'][key];
	}
}

languages['webidl'] = languages['web-idl'];
