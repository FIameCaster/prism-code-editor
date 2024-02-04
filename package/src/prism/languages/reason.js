import { languages } from '../core.js';
import { extend, insertBefore } from '../utils/language.js';
import './clike.js';

insertBefore(
	languages.reason = extend('clike', {
		'string': {
			pattern: /"(?:\\[\s\S]|[^\\\n"])*"/g,
			greedy: true
		},
		// 'class-name' must be matched *after* 'constructor' defined below
		'class-name': /\b[A-Z]\w*/,
		'keyword': /\b(?:and|as|assert|begin|class|constraint|do|done|downto|else|end|exception|external|for|fun|function|functor|if|in|include|inherit|initializer|lazy|let|method|module|mutable|new|nonrec|object|of|open|or|private|rec|sig|struct|switch|then|to|try|type|val|virtual|when|while|with)\b/,
		'operator': /\.{3}|:[:=]|\|>|->|=(?:==?|>)?|<=?|>=?|[|^?'#!~`]|[+\-*\/]\.?|\b(?:asr|land|lor|lsl|lsr|lxor|mod)\b/
	}),
	'class-name', {
		'char': {
			pattern: /'(?:\\x[\da-f]{2}|\\o[0-3][0-7][0-7]|\\\d{3}|\\.|[^'\\\n])'/g,
			greedy: true
		},
		// Negative look-ahead prevents from matching things like String.capitalize
		'constructor': /\b[A-Z]\w*\b(?!\s*\.)/,
		'label': {
			pattern: /\b[a-z]\w*(?=::)/,
			alias: 'symbol'
		}
	}
);

// We can't match functions property, so let's not even try.
delete languages.reason.function;
