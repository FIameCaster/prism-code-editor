import { languages } from '../core.js';
import './yaml.js';

// https://en.wikipedia.org/wiki/Test_Anything_Protocol

languages.tap = {
	'fail': /not ok[^#{\n\r]*/,
	'pass': /ok[^#{\n\r]*/,
	'pragma': /pragma [+-][a-z]+/,
	'bailout': /bail out!.*/i,
	'version': /TAP version \d+/i,
	'plan': /\b\d+\.\.\d+(?: +#.*)?/,
	'subtest': {
		pattern: /# Subtest(?:: .*)?/,
		greedy: true
	},
	'punctuation': /[{}]/,
	'directive': /#.*/,
	'yamlish': {
		pattern: /(^[ \t]*)---[\s\S]*?[\r\n][ \t]*\.{3}$/m,
		lookbehind: true,
		inside: languages.yaml,
		alias: 'language-yaml'
	}
};
