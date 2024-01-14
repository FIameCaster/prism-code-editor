import { languages } from '../core.js';

// Many of the following regexes will contain negated lookaheads like `[ \t]+(?![ \t])`. This is a trick to ensure
// that quantifiers behave *atomically*. Atomic quantifiers are necessary to prevent exponential backtracking.

var spaceAfterBackSlash = /\\\n(?:\s|\\\n|#.*(?!.))*(?![\s#]|\\\n)/.source;
// At least one space, comment, or line break
var space = /(?:[ \t]+(?![ \t])(?:<SP_BS>)?|<SP_BS>)/.source
	.replace(/<SP_BS>/g, spaceAfterBackSlash);

var string = /"(?:[^"\\\n]|\\[\s\S])*"|'(?:[^'\\\n]|\\[\s\S])*'/.source;
var option = /--[\w-]+=(?:<STR>|(?!["'])(?:[^\s\\]|\\.)+)/.source.replace(/<STR>/g, string);

var stringRule = {
	pattern: RegExp(string),
	greedy: true
};
var commentRule = {
	pattern: /(^[ \t]*)#.*/m,
	lookbehind: true,
	greedy: true
};

/**
 * @param {string} source
 * @param {string} flags
 * @returns {RegExp}
 */
var re = (source, flags) => 
	RegExp(source
		.replace(/<OPT>/g, option)
		.replace(/<SP>/g, space), flags);

languages.dockerfile = languages.docker = {
	'instruction': {
		pattern: /(^[ \t]*)(?:ADD|ARG|CMD|COPY|ENTRYPOINT|ENV|EXPOSE|FROM|HEALTHCHECK|LABEL|MAINTAINER|ONBUILD|RUN|SHELL|STOPSIGNAL|USER|VOLUME|WORKDIR)(?=\s)(?:\\.|[^\n\\])*(?:\\$(?:\s|#.*$)*(?![\s#])(?:\\.|[^\n\\])*)*/im,
		lookbehind: true,
		greedy: true,
		inside: {
			'options': {
				pattern: re(/(^(?:ONBUILD<SP>)?\w+<SP>)<OPT>(?:<SP><OPT>)*/.source, 'i'),
				lookbehind: true,
				greedy: true,
				inside: {
					'property': {
						pattern: /(^|\s)--[\w-]+/,
						lookbehind: true
					},
					'string': [
						stringRule,
						{
							pattern: /(=)(?!["'])(?:[^\s\\]|\\.)+/,
							lookbehind: true
						}
					],
					'operator': /\\$/m,
					'punctuation': /=/
				}
			},
			'keyword': [
				{
					// https://docs.docker.com/engine/reference/builder/#healthcheck
					pattern: re(/(^(?:ONBUILD<SP>)?HEALTHCHECK<SP>(?:<OPT><SP>)*)(?:CMD|NONE)\b/.source, 'i'),
					lookbehind: true,
					greedy: true
				},
				{
					// https://docs.docker.com/engine/reference/builder/#from
					pattern: re(/(^(?:ONBUILD<SP>)?FROM<SP>(?:<OPT><SP>)*(?!--)[^ \t\\]+<SP>)AS/.source, 'i'),
					lookbehind: true,
					greedy: true
				},
				{
					// https://docs.docker.com/engine/reference/builder/#onbuild
					pattern: re(/(^ONBUILD<SP>)\w+/.source, 'i'),
					lookbehind: true,
					greedy: true
				},
				{
					pattern: /^\w+/,
					greedy: true
				}
			],
			'comment': commentRule,
			'string': stringRule,
			'variable': /\$(?:\w+|\{[^{}"'\\]*\})/,
			'operator': /\\$/m
		}
	},
	'comment': commentRule
};
