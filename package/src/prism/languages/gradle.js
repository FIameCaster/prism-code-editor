import { languages } from '../core.js';
import { extend, insertBefore } from '../utils/language.js';
import './clike.js';

var expression = {
	pattern: /[\s\S]+/
}

var interpolation = {
	pattern: /((?:^|[^\\$])(?:\\\\)*)\$(?:\w+|\{[^{}]*\})/,
	lookbehind: true,
	inside: {
		'interpolation-punctuation': {
			pattern: /^\$\{?|\}$/,
			alias: 'punctuation',
		},
		'expression': expression,
	},
};

var gradle = expression.inside = languages.gradle = extend('clike', {
	'string': {
		pattern: /'''(?:\\[\s\S]|[^\\])*?'''|'(?:\\.|[^\\\n'])*'/g,
		greedy: true,
	},
	'keyword':
		/\b(?:apply|def|dependencies|else|if|implementation|import|plugins?|project|repositories|repository|sourceSets|tasks|val)\b/,
	'number': /\b(?:0b[01_]+|0x[a-f\d_]+(?:\.[a-f\d_p-]+)?|[\d_]+(?:\.[\d_]+)?(?:e[+-]?\d+)?)[glidf]?\b/i,
	'operator': {
		pattern: /(^|[^.])(?:~|==?~?|\?[.:]?|\*\.|\.[@&]|\.\.<|\.\.(?!\.)|--|\+\+|&&|\|\||\*\*=?|->|>>>?=?|<<=?|<=>?|[%&|^!=<>/*+-]=?)/,
		lookbehind: true,
	},
	'punctuation': /\.+|[()[\]{},:;$]/,
});

insertBefore(gradle, 'string', {
	'shebang': {
		pattern: /#!.+/g,
		alias: 'comment',
		greedy: true,
	},
	'interpolation-string': {
		pattern:
			/"""(?:\\[\s\S]|[^\\])*?"""|(["/])(?:\\.|(?!\1)[^\\\n])*\1|\$\/(?:[^/$]|\$(?:[/$]|(?![/$]))|\/(?!\$))*\/\$/g,
		greedy: true,
		inside: {
			'interpolation': interpolation,
			'string': /[\s\S]+/,
		},
	},
});

insertBefore(gradle, 'punctuation', {
	'spock-block': /\b(?:and|cleanup|expect|given|setup|[tw]hen|where):/,
});

insertBefore(gradle, 'function', {
	'annotation': {
		pattern: /(^|[^.])@\w+/,
		lookbehind: true,
		alias: 'punctuation',
	},
});
