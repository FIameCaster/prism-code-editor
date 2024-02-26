import { languages } from '../core.js';

// This is a language definition for generic log files.
// Since there is no one log format, this language definition has to support all formats to some degree.
//
// Based on https://github.com/MTDL9/vim-log-highlighting

languages.log = {
	'string': {
		// Single-quoted strings must not be confused with plain text. E.g. Can't isn't Susan's Chris' toy
		pattern: /"(?:\\.|[^\\\n"])*"|'(?![st] | \w)(?:\\.|[^\\\n'])*'/g,
		greedy: true,
	},

	'exception': {
		pattern: /(^|[^\w.])[a-z][\w.]*(?:Error|Exception):.*(?:\n[ \t]*(?:at[ \t].+|\.{3}.*|Caused by:.*))+(?:\n[ \t]*\.{3} .*)?/g,
		lookbehind: true,
		greedy: true,
		alias: 'language-javastacktrace',
		inside: languages['javastacktrace'] || {
			'keyword': /\bat\b/,
			'function': /[a-z_][$\w]*(?=\()/,
			'punctuation': /[().:]/
		}
	},

	'level': [
		{
			pattern: /\b(?:ALERT|CRIT|CRITICAL|EMERG|EMERGENCY|ERR|ERROR|FAILURE|FATAL|SEVERE)\b/,
			alias: 'error important'
		},
		{
			pattern: /\b(?:WARN|WARNING|WRN)\b/,
			alias: 'warning important'
		},
		{
			pattern: /\b(?:DISPLAY|INF|INFO|NOTICE|STATUS)\b/,
			alias: 'info keyword'
		},
		{
			pattern: /\b(?:DBG|DEBUG|FINE)\b/,
			alias: 'debug keyword'
		},
		{
			pattern: /\b(?:FINER|FINEST|TRACE|TRC|VERBOSE|VRB)\b/,
			alias: 'trace comment'
		}
	],

	'property': {
		pattern: /((?:^|[\]|])[ \t]*)[a-z_](?:[\w-]|\b\/\b)*(?:[. ]\(?\w(?:[\w-]|\b\/\b)*\)?)*:(?=\s)/im,
		lookbehind: true
	},

	'separator': {
		pattern: /(^|[^-+])-{3,}|={3,}|\*{3,}|- - /m,
		lookbehind: true,
		alias: 'comment'
	},

	'url': /\b(?:file|ftp|https?):\/\/[^\s|,;'"]*[^\s|,;'">.]/,
	'email': {
		pattern: /(^|\s)[-\w+.]+@[a-z][a-z\d-]*(?:\.[a-z][a-z\d-]*)+(?=\s)/,
		lookbehind: true,
		alias: 'url'
	},

	'ip-address': {
		pattern: /\b(?:\d{1,3}(?:\.\d{1,3}){3})\b/,
		alias: 'constant'
	},
	'mac-address': {
		pattern: /\b[a-f\d]{2}(?::[a-f\d]{2}){5}\b/i,
		alias: 'constant'
	},
	'domain': {
		pattern: /(^|\s)[a-z][a-z\d-]*(?:\.[a-z][a-z\d-]*)*\.[a-z][a-z\d-]+(?=\s)/,
		lookbehind: true,
		alias: 'constant'
	},

	'uuid': {
		pattern: /\b[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}\b/i,
		alias: 'constant'
	},
	'hash': {
		pattern: /\b(?:[a-f\d]{32}){1,2}\b/i,
		alias: 'constant'
	},

	'file-path': {
		pattern: /\b[a-z]:[\\/][^\s()[\]{},;:|"']+|(^|[\s:[\](>|])\.{0,2}\/\w[^\s()[\]{},;:|"']*/gi,
		lookbehind: true,
		greedy: true,
		alias: 'string'
	},

	'date': {
		pattern: /\b\d{4}[-/]\d{2}[-/]\d{2}(?:T(?=\d{1,2}:)|(?=\s\d{1,2}:))|\b\d{1,4}[-/ ](?:\d{1,2}|apr|aug|dec|feb|jan|jul|jun|mar|may|nov|oct|sep)[-/ ]\d{2,4}T?\b|\b(?:(?:fri|mon|sat|sun|thu|tue|wed)(?:\s{1,2}(?:apr|aug|dec|feb|jan|jul|jun|mar|may|nov|oct|sep))?|apr|aug|dec|feb|jan|jul|jun|mar|may|nov|oct|sep)\s{1,2}\d{1,2}\b/i,
		alias: 'number'
	},
	'time': {
		pattern: /\b\d{1,2}:\d{1,2}:\d{1,2}(?:[.,:]\d+)?(?:\s?[+-]\d{2}:?\d{2}|Z)?\b/,
		alias: 'number'
	},

	'boolean': /\b(?:false|null|true)\b/i,
	'number': {
		pattern: /(^|[^.\w])(?:0x[a-f\d]+|0o[0-7]+|0b[01]+|v?\d[a-f\d]*(?:\.\d+)*(?:e[+-]?\d+)?[a-z]{0,3}\b)\b(?!\.\w)/i,
		lookbehind: true
	},

	'operator': /[;:?<=>~/@!$%&|^(){}*#+-]/,
	'punctuation': /[[\].,]/
};
