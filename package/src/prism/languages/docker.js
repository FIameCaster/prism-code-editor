import { languages } from '../core.js';
import { re, replace } from '../utils/shared.js';

// Many of the following regexes will contain negated lookaheads like `[ \t]+(?![ \t])`. This is a trick to ensure
// that quantifiers behave *atomically*. Atomic quantifiers are necessary to prevent exponential backtracking.

var spaceAfterBackSlash = /\\\n(?:\s|\\\n|#.*(?!.))*(?![\s#]|\\\n)/.source;
// At least one space, comment, or line break
var space = replace(/(?:[ \t]+(?![ \t])<0>?|<0>)/.source, [spaceAfterBackSlash]);

var string = /"(?:\\[\s\S]|[^\\\n"])*"|'(?:\\[\s\S]|[^\\\n'])*'/g;
var stringSrc = string.source;
var option = replace(/--[\w-]+=(?:<0>|(?!["'])(?:\\.|[^\\\s])+)/.source, [stringSrc]);

var stringRule = {
	pattern: string,
	greedy: true
};
var commentRule = {
	pattern: /(^[ \t]*)#.*/mg,
	lookbehind: true,
	greedy: true
};

languages.dockerfile = languages.docker = {
	'instruction': {
		pattern: /(^[ \t]*)(?:ADD|ARG|CMD|COPY|ENTRYPOINT|ENV|EXPOSE|FROM|HEALTHCHECK|LABEL|MAINTAINER|ONBUILD|RUN|SHELL|STOPSIGNAL|USER|VOLUME|WORKDIR)(?=\s)(?:\\.|[^\\\n])*(?:\\$(?:\s|#.*$)*(?![\s#])(?:\\.|[^\\\n])*)*/img,
		lookbehind: true,
		greedy: true,
		inside: {
			'options': {
				pattern: re(/(^(?:ONBUILD<0>)?\w+<0>)<1>(?:<0><1>)*/.source, [space, option], 'gi'),
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
							pattern: /(=)(?!["'])(?:\\.|[^\\\s])+/,
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
					pattern: re(/(^(?:ONBUILD<0>)?HEALTHCHECK<0>(?:<1><0>)*)(?:CMD|NONE)\b/.source, [space, option], 'gi'),
					lookbehind: true,
					greedy: true
				},
				{
					// https://docs.docker.com/engine/reference/builder/#from
					pattern: re(/(^(?:ONBUILD<0>)?FROM<0>(?:<1><0>)*(?!--)[^ \t\\]+<0>)AS/.source, [space, option], 'gi'),
					lookbehind: true,
					greedy: true
				},
				{
					// https://docs.docker.com/engine/reference/builder/#onbuild
					pattern: re(/(^ONBUILD<0>)\w+/.source, [space], 'gi'),
					lookbehind: true,
					greedy: true
				},
				{
					pattern: /^\w+/g,
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
