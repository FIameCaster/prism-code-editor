import { languages } from '../core.js';
import { boolean } from '../utils/shared.js';

// https://gn.googlesource.com/gn/+/refs/heads/main/docs/reference.md#grammar

var expression = {
	pattern: /[\s\S]+/
};

expression.inside = languages.gni = languages.gn = {
	'comment': {
		pattern: /#.*/g,
		greedy: true
	},
	'string-literal': {
		pattern: /(^|[^\\"])"(?:[^\n"\\]|\\.)*"/g,
		lookbehind: true,
		greedy: true,
		inside: {
			'interpolation': {
				pattern: /((?:^|[^\\])(?:\\{2})*)\$(?:\{[\s\S]*?\}|[a-zA-Z_]\w*|0x[a-fA-F0-9]{2})/,
				lookbehind: true,
				inside: {
					'number': /^\$0x[\s\S]{2}$/,
					'variable': /^\$\w+$/,
					'interpolation-punctuation': {
						pattern: /^\$\{|\}$/,
						alias: 'punctuation'
					},
					'expression': expression
				}
			},
			'string': /[\s\S]+/
		}
	},

	'keyword': /\b(?:else|if)\b/,
	'boolean': boolean,
	'builtin-function': {
		// a few functions get special highlighting to improve readability
		pattern: /\b(?:assert|defined|foreach|import|pool|print|template|tool|toolchain)(?=\s*\()/i,
		alias: 'keyword'
	},
	'function': /\b[a-z_]\w*(?=\s*\()/i,
	'constant': /\b(?:current_cpu|current_os|current_toolchain|default_toolchain|host_cpu|host_os|root_build_dir|root_gen_dir|root_out_dir|target_cpu|target_gen_dir|target_os|target_out_dir)\b/,

	'number': /-?\b\d+\b/,

	'operator': /[-+!=<>]=?|&&|\|\|/,
	'punctuation': /[(){}[\],.]/
};
