import { languages } from '../core.js';
import { clikeComment } from '../utils/shared.js';

// GitHub: https://github.com/apache/avro
// Docs: https://avro.apache.org/docs/current/idl.html

languages.avdl =languages['avro-idl'] = {
	'comment': clikeComment(),
	'string': {
		pattern: /(^|[^\\])"(?:[^\n"\\]|\\.)*"/g,
		lookbehind: true,
		greedy: true
	},

	'annotation': {
		pattern: /@(?:[$\w.-]|`[^\n`]+`)+/g,
		greedy: true,
		alias: 'function'
	},
	'function-identifier': {
		pattern: /`[^\n`]+`(?=\s*\()/g,
		greedy: true,
		alias: 'function'
	},
	'identifier': {
		pattern: /`[^\n`]+`/g,
		greedy: true
	},

	'class-name': {
		pattern: /(\b(?:enum|error|protocol|record|throws)\b\s+)[$\w]+/g,
		lookbehind: true,
		greedy: true
	},
	'keyword': /\b(?:array|boolean|bytes|date|decimal|double|enum|error|false|fixed|float|idl|import|int|local_timestamp_ms|long|map|null|oneway|protocol|record|schema|string|throws|time_ms|timestamp_ms|true|union|uuid|void)\b/,
	'function': /\b[a-z_]\w*(?=\s*\()/i,

	'number': [
		{
			pattern: /(^|[^\w.])-?(?:(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?|0x(?:[a-f0-9]+(?:\.[a-f0-9]*)?|\.[a-f0-9]+)(?:p[+-]?\d+)?)[dfl]?(?![\w.])/i,
			lookbehind: true
		},
		/-?\b(?:Infinity|NaN)\b/
	],

	'operator': /=/,
	'punctuation': /[()[\]{}<>.:,;-]/
};
