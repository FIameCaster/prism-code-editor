import { languages } from '../core.js';

// https://yaml.org/spec/1.2/spec.html#c-ns-anchor-property
// https://yaml.org/spec/1.2/spec.html#c-ns-alias-node
var anchorOrAlias = /[*&][^\s[\]{},]+/;
// https://yaml.org/spec/1.2/spec.html#c-ns-tag-property
var tag = /!(?:<[\w\-%#;/?:@&=+$,.!~*'()[\]]+>|(?:[a-zA-Z\d-]*!)?[\w\-%#;/?:@&=+$.~*'()]+)?/;
// https://yaml.org/spec/1.2/spec.html#c-ns-properties(n,c)
var properties = `(?:${tag.source}(?:[ \t]+${anchorOrAlias.source})?|${anchorOrAlias.source}(?:[ \t]+${tag.source})?)`;
// https://yaml.org/spec/1.2/spec.html#ns-plain(n,c)
// This is a simplified version that doesn't support "#" and multiline keys
// All these long scarry character classes are simplified versions of YAML's characters
var plainKey = /(?:[^\s\0-\x08\x0e-\x1f!"#%&'*,\-:>?@[\]`{|}\x7f-\x84\x86-\x9f\ud800-\udfff\ufffe\uffff]|[?:-]<PLAIN>)(?:[ \t]*(?:(?![#:])<PLAIN>|:<PLAIN>))*/.source
	.replace(/<PLAIN>/g, /[^\s\0-\x08\x0e-\x1f,[\]{}\x7f-\x84\x86-\x9f\ud800-\udfff\ufffe\uffff]/.source);
var string = /"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'/.source;

/**
 *
 * @param {string} value
 * @param {string} [flags]
 * @returns {RegExp}
 */
var createValuePattern = (value, flags) => RegExp(
	/([:\-,[{]\s*(?:\s<<prop>>[ \t]+)?)(?:<<value>>)(?=[ \t]*(?:$|,|\]|\}|(?:\n\s*)?#))/.source
		.replace(/<<prop>>/g, () => properties).replace(/<<value>>/g, value),
	flags
);

languages.yml = languages.yaml = {
	'scalar': {
		pattern: RegExp(/([\-:]\s*(?:\s<<prop>>[ \t]+)?[|>])[ \t]*(?:(\n[ \t]+)\S.*(?:\2.+)*)/.source
			.replace(/<<prop>>/g, () => properties)),
		lookbehind: true,
		alias: 'string'
	},
	'comment': /#.*/,
	'key': {
		pattern: RegExp(/((?:^|[:\-,[{\n?])[ \t]*(?:<<prop>>[ \t]+)?)<<key>>(?=\s*:\s)/.source
			.replace(/<<prop>>/g, () => properties)
			.replace(/<<key>>/g, '(?:' + plainKey + '|' + string + ')'), 'g'),
		lookbehind: true,
		greedy: true,
		alias: 'atrule'
	},
	'directive': {
		pattern: /(^[ \t]*)%.+/m,
		lookbehind: true,
		alias: 'important'
	},
	'datetime': {
		pattern: createValuePattern(/\d{4}-\d\d?-\d\d?(?:[tT]|[ \t]+)\d\d?:\d{2}:\d{2}(?:\.\d*)?(?:[ \t]*(?:Z|[-+]\d\d?(?::\d{2})?))?|\d{4}-\d{2}-\d{2}|\d\d?:\d{2}(?::\d{2}(?:\.\d*)?)?/.source, 'm'),
		lookbehind: true,
		alias: 'number'
	},
	'boolean': {
		pattern: createValuePattern(/false|true/.source, 'im'),
		lookbehind: true,
		alias: 'important'
	},
	'null': {
		pattern: createValuePattern(/null|~/.source, 'im'),
		lookbehind: true,
		alias: 'important'
	},
	'string': {
		pattern: createValuePattern(string, 'mg'),
		lookbehind: true,
		greedy: true
	},
	'number': {
		pattern: createValuePattern(/[+-]?(?:0x[\da-f]+|0o[0-7]+|(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?|\.inf|\.nan)/.source, 'im'),
		lookbehind: true
	},
	'tag': tag,
	'important': anchorOrAlias,
	'punctuation': /---|[:[\]{}\-,|>?]|\.{3}/
};
