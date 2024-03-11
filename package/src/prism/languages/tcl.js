import { languages } from '../core.js';

languages.tcl = {
	'comment': /#.*/,
	'string': {
		pattern: /"(?:\\[\s\S]|[^\\\n"])*"/g,
		greedy: true
	},
	'variable': [
		{
			pattern: /(\$)(?:(?:::)?(?:[a-zA-Z\d]+::)*\w+|\{[^}]+\})/,
			lookbehind: true
		},
		{
			pattern: /(^[ \t]*set[ \t]+)(?:::)?(?:[a-zA-Z\d]+::)*\w+/m,
			lookbehind: true
		}
	],
	'function': {
		pattern: /(^[ \t]*proc[ \t]+)\S+/m,
		lookbehind: true
	},
	'builtin': {
		pattern: /(^[ \t]*)(?:break|class|continue|error|eval|exit|for|foreach|if|proc|return|switch|while)\b|\belse(?:if)?\b/m,
		lookbehind: true
	},
	'scope': {
		pattern: /(^[ \t]*)(?:global|upvar|variable)\b/m,
		lookbehind: true,
		alias: 'constant'
	},
	'keyword': {
		pattern: /(^[ \t]*|\[)(?:Safe_Base|Tcl|after|apply|array|auto_(?:execok|import|load|mkindex|qualify|reset)|automkindex_old|bgerror|binary|catch|cd|chan|clock|close|concat|dde|dict|encoding|eof|exec|expr|fblocked|fconfigure|fcopy|file(?:event|name)?|flush|gets|glob|history|http|incr|info|interp|join|l?append|lassign|lindex|linsert|list|llength|load|lrange|lrepeat|lreplace|lreverse|lsearch|l?set|lsort|mathfunc|mathop|memory|msgcat|namespace|open|package|parray|pid|pkg_mkIndex|platform|puts|pwd|re_syntax|read|refchan|regexp|registry|regsub|rename|scan|seek|socket|source|split|string|subst|tcl(?:_endOfWord|_findLibrary|startOf(?:Next|Previous)Word|test|vars|wordBreak(?:After|Before))|tell|time|tm|trace|unknown|unload|unset|update|uplevel|vwait)\b/m,
		lookbehind: true
	},
	'operator': /\*\*?|==|&&?|\|\|?|>>|<<|[!<>]=?|[~/%?^+-]|\b(?:eq|in|ne|ni)\b/,
	'punctuation': /[()[\]{}]/
};
