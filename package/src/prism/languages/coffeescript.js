import { languages } from '../core.js';
import { extend, insertBefore } from '../utils/language.js';
import './javascript.js';

// Ignore comments starting with { to privilege string interpolation highlighting
var comment = /#(?!\{).+/;
var interpolation = {
	pattern: /#\{[^}]+\}/,
	alias: 'variable'
};

var coffee = languages.coffee = languages.coffeescript = extend('js', {
	'comment': comment,
	'string': [

		// Strings are multiline
		{
			pattern: /'(?:\\[\s\S]|[^\\'])*'/g,
			greedy: true
		},

		{
			// Strings are multiline
			pattern: /"(?:\\[\s\S]|[^\\"])*"/g,
			greedy: true,
			inside: {
				'interpolation': interpolation
			}
		}
	],
	'keyword': /\b(?:and|break|by|catch|class|continue|debugger|delete|do|each|else|extends?|false|true|finally|f?or|i[fns]|instanceof|isnt|let|loop|namespace|new|not?|null|off?|ow?n|return|super|switch|[tw]hen|this|throw|try|typeof|undefined|unless|until|while|window|with|yes|yield)\b/,
	'class-member': {
		pattern: /@(?!\d)\w+/,
		alias: 'variable'
	}
});

insertBefore(coffee, 'comment', {
	'multiline-comment': {
		pattern: /###[\s\S]+?###/,
		alias: 'comment'
	},

	// Block regexp can contain comments and interpolation
	'block-regex': {
		pattern: /\/{3}[\s\S]*?\/{3}/,
		alias: 'regex',
		inside: {
			'comment': comment,
			'interpolation': interpolation
		}
	}
});

insertBefore(coffee, 'string', {
	'inline-javascript': {
		pattern: /`(?:\\[\s\S]|[^\\`])*`/,
		inside: {
			'delimiter': {
				pattern: /^`|`$/,
				alias: 'punctuation'
			},
			'script': {
				pattern: /[\s\S]+/,
				alias: 'language-javascript',
				inside: 'js'
			}
		}
	},

	// Block strings
	'multiline-string': [
		{
			pattern: /'''[\s\S]*?'''/g,
			greedy: true,
			alias: 'string'
		},
		{
			pattern: /"""[\s\S]*?"""/g,
			greedy: true,
			alias: 'string',
			inside: {
				'interpolation': interpolation
			}
		}
	]

});

insertBefore(coffee, 'keyword', {
	// Object property
	'property': /(?!\d)\w+(?=\s*:(?!:))/
});

delete coffee['template-string'];
