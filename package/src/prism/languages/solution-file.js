import { languages } from '../core.js';

var guid = {
	// https://en.wikipedia.org/wiki/Universally_unique_identifier#Format
	pattern: /\{[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}\}/i,
	alias: 'constant',
	inside: {
		'punctuation': /[{}]/
	}
};

languages['solution-file'] = {
	'comment': {
		pattern: /#.*/g,
		greedy: true
	},
	'string': {
		pattern: /"[^"\n]*"|'[^'\n]*'/g,
		greedy: true,
		inside: {
			'guid': guid
		}
	},
	'object': {
		// Foo
		//   Bar("abs") = 9
		//   EndBar
		//   Prop = TRUE
		// EndFoo
		pattern: /^([ \t]*)(?:([A-Z]\w*)\b(?=.*\n(?:\1[ \t].*\n)*\1End\2(?=[ \t]*$))|End[A-Z]\w*(?=[ \t]*$))/mg,
		lookbehind: true,
		greedy: true,
		alias: 'keyword'
	},
	'property': {
		pattern: /^([ \t]*)(?!\s)[^\n"#=()]*[^\s"#=()](?=\s*=)/m,
		lookbehind: true,
		inside: {
			'guid': guid
		}
	},
	'guid': guid,
	'number': /\b\d+(?:\.\d+)*\b/,
	'boolean': /\b(?:FALSE|TRUE)\b/,
	'operator': /=/,
	'punctuation': /[(),]/
};

languages['sln'] = languages['solution-file'];
