import { languages } from '../core.js';
import { boolean, clikePunctuation } from '../utils/shared.js';

languages.fsharp = {
	'comment': {
		pattern: /\/\/.*|\(\*(?!\))[\s\S]*?\*\)/,
		greedy: true
	},
	'annotation': {
		pattern: /\[<.+?>\]/,
		greedy: true,
		inside: {
			'punctuation': /^\[<|>\]$/,
			'class-name': {
				pattern: /^\w+$|(^|;\s*)[A-Z]\w*(?=\()/,
				lookbehind: true
			},
			'annotation-content': {
				pattern: /[\s\S]+/,
				inside: 'fsharp'
			}
		}
	},
	'char': {
		pattern: /'(?:[^\\']|\\(?:.|\d{3}|x[a-fA-F\d]{2}|u[a-fA-F\d]{4}|U[a-fA-F\d]{8}))'B?/,
		greedy: true
	},
	'string': {
		pattern: /(?:"""[\s\S]*?"""|@"(?:""|[^"])*"|"(?:\\[\s\S]|[^\\"])*")B?/,
		greedy: true
	},
	'class-name': {
		pattern: /(\b(?:exception|inherit|interface|new|of|type)\s+|\w\s*:\s*|\s:\??>\s*)[.\w]+\b(?:\s*(?:->|\*)\s*[.\w]+\b)*(?!\s*[:.])/,
		lookbehind: true,
		inside: {
			'operator': /->|\*/,
			'punctuation': /\./
		}
	},
	'preprocessor': {
		pattern: /(^[\t ]*)#.*/m,
		lookbehind: true,
		alias: 'property',
		inside: {
			'directive': {
				pattern: /(^#)\b(?:else|endif|if|light|line|nowarn)\b/,
				lookbehind: true,
				alias: 'keyword'
			}
		}
	},
	'keyword': /\b(?:let|return|use|yield)(?:!\B|\b)|\b(?:abstract|and|as|asr|assert|atomic|base|begin|break|checked|class|component|const|constraint|constructor|continue|default|delegate|do|done|downcast|downto|eager|elif|else|end|event|exception|extern|external|false|finally|fixed|for|fun|function|functor|global|if|in|include|inherit|inline|interface|internal|land|lazy|lor|lsl|lsr|lxor|match|member|method|mixin|mod|module|mutable|namespace|new|not|null|object|of|open|or|override|parallel|private|process|protected|public|pure|rec|sealed|select|sig|static|struct|tailcall|then|to|trait|true|try|type|upcast|val|virtual|void|volatile|when|while|with)\b/,
	'boolean': boolean,
	'function': /\b\w+(?=\()/,
	'number': [
		/\b0x[\da-fA-F]+(?:LF|lf|un)?\b/,
		/\b0b[01]+(?:uy|y)?\b/,
		/(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:[fm]|e[+-]?\d+)?\b/i,
		/\b\d+(?:[IlLsy]|UL|u[lsy]?)?\b/
	],
	'operator': /([<>~&^])\1\1|([*.:<>&])\2|<-|->|[!=:]=|<?\|{1,3}>?|\??(?:<=|>=|<>|[-+*/%=<>])\??|[!?^&]|~[+~-]|:>|:\?>?/,
	'computation-expression': {
		pattern: /\b[_a-z]\w*(?=\s*\{)/i,
		alias: 'keyword'
	},
	'punctuation': clikePunctuation
};
