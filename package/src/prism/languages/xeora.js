import { languages } from '../core.js';
import { clone, insertBefore } from '../utils/language.js';
import './markup.js';

var xeora = languages.xeoracube = languages.xeora = clone(languages.html);

var variable = {
	pattern: /(?:[,|])@?(?:#+|[*~=^+-])?[\w.]+/,
	inside: {
		'punctuation': /[,.|]/,
		'operator': /#+|[*~=^@+-]/
	}
};

insertBefore(xeora, 'markup-bracket', {
	'constant': {
		pattern: /\$(?:DomainContents|PageRenderDuration)\$/,
		inside: {
			'punctuation': /\$/
		}
	},
	'variable': {
		pattern: /\$@?(?:#+|[*~=^+-])?[\w.]+\$/,
		inside: {
			'punctuation': /[$.]/,
			'operator': /#+|[*~=^@+-]/
		}
	},
	'function-inline': {
		pattern: /\$F:[\w.-]+\?[\w.-]+(?:,(?:(?:@[-#]*\w+\.[\w+.]\.*)*\|)*(?:(?:[\w+]|[-#*.~^]+[\w+]|=\S)(?:[^$=]|=+[^=])*=*|(?:@[-#]*\w+\.[\w+.]\.*)+(?:(?:[\w+]|[-#*~^][-#*.~^]*[\w+]|=\S)(?:[^$=]|=+[^=])*=*)?)?)?\$/,
		inside: {
			'variable': variable,
			'punctuation': /\$\w:|[$?.,:|]/
		},
		alias: 'function'
	},
	'function-block': {
		pattern: /\$XF:\{[\w.-]+\?[\w.-]+(?:,(?:(?:@[-#]*\w+\.[\w+.]\.*)*\|)*(?:(?:[\w+]|[-#*.~^]+[\w+]|=\S)(?:[^$=]|=+[^=])*=*|(?:@[-#]*\w+\.[\w+.]\.*)+(?:(?:[\w+]|[-#*~^][-#*.~^]*[\w+]|=\S)(?:[^$=]|=+[^=])*=*)?)?)?\}:XF\$/,
		inside: {
			'variable': variable,
			'punctuation': /[{}$?.,:|]/
		},
		alias: 'function'
	},
	'directive-inline': {
		pattern: /\$\w(?:#\d+\+?)?(?:\[[\w.-]+\])?:[-/\w.]+\$/,
		inside: {
			'punctuation': {
				pattern: /\$(?:\w:|C(?:\[|#\d))?|[:{[\]]/,
				inside: {
					'tag': /#\d/
				}
			}
		},
		alias: 'function'
	},
	'directive-block-open': {
		pattern: /\$\w+:\{|\$\w(?:#\d+\+?)?(?:\[[\w.-]+\])?:[\w.-]+:\{(?:![A-Z]+)?/,
		inside: {
			'punctuation': {
				pattern: /\$(?:\w:|C(?:\[|#\d))?|[:{[\]]/,
				inside: {
					'tag': /#\d/
				}
			},
			'attribute': {
				pattern: /![A-Z]+$/,
				inside: {
					'punctuation': /!/
				},
				alias: 'keyword'
			}
		},
		alias: 'function'
	},
	'directive-block-separator': {
		pattern: /\}:[\w.-]+:\{/,
		inside: {
			'punctuation': /[:{}]/
		},
		alias: 'function'
	},
	'directive-block-close': {
		pattern: /\}:[\w.-]+\$/,
		inside: {
			'punctuation': /[:{}$]/
		},
		alias: 'function'
	}
});
