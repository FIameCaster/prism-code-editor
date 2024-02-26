import { languages } from '../core.js';
import { clikePunctuation } from '../utils/shared.js';

languages.cypher = {
	// https://neo4j.com/docs/cypher-manual/current/syntax/comments/
	'comment': /\/\/.*/,
	'string': {
		pattern: /"(?:\\.|[^\\\n"])*"|'(?:\\.|[^\\\n'])*'/g,
		greedy: true
	},
	'class-name': {
		pattern: /(:\s*)(?:\w+|`(?:[^\\\n`])*`)(?=\s*[{):])/g,
		lookbehind: true,
		greedy: true
	},
	'relationship': {
		pattern: /(-\[\s*(?:\w+\s*|`(?:[^\\\n`])*`\s*)?:\s*|\|\s*:\s*)(?:\w+|`(?:[^\\\n`])*`)/g,
		lookbehind: true,
		greedy: true,
		alias: 'property'
	},
	'identifier': {
		pattern: /`(?:[^\\\n`])*`/g,
		greedy: true
	},

	'variable': /\$\w+/,

	// https://neo4j.com/docs/cypher-manual/current/syntax/reserved/
	'keyword': /\b(?:ADD|ALL|AND|AS|ASC|ASCENDING|ASSERT|BY|CALL|CASE|COMMIT|CONSTRAINT|CONTAINS|CREATE|CSV|DELETE|DESC|DESCENDING|DETACH|DISTINCT|DO|DROP|ELSE|END|ENDS|EXISTS|FOR|FOREACH|IN|INDEX|IS|JOIN|KEY|LIMIT|LOAD|MANDATORY|MATCH|MERGE|NODE|NOT|OF|ON|OPTIONAL|OR|ORDER(?=\s+BY)|PERIODIC|REMOVE|REQUIRE|RETURN|SCALAR|SCAN|SET|SKIP|START|STARTS|THEN|UNION|UNIQUE|UNWIND|USING|WHEN|WHERE|WITH|XOR|YIELD)\b/i,

	'function': /\b\w+(?=\s*\()/,

	'boolean': /\b(?:false|null|true)\b/i,
	'number': /\b(?:0x[a-fA-F\d]+|\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\b/,
	// https://neo4j.com/docs/cypher-manual/current/syntax/operators/
	'operator': /:|<--?|--?>?|<>|=~?|[<>]=?|[+*/%^|]|\.{2,3}/,
	'punctuation': clikePunctuation
};
