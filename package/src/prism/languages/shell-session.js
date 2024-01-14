import { languages } from '../core.js';
import './bash.js';

// CAREFUL!
// The following patterns are concatenated, so the group referenced by a back reference is non-obvious!

languages['sh-session'] = languages.shellsession = languages['shell-session'] = {
	'command': {
		pattern: /^(?:[^\s@:$#%*!/\\]+@[^\r\n@:$#%*!/\\]+(?::[^\0-\x1F$#%*?"<>:;|]+)?|[/~.][^\0-\x1F$#%*?"<>@:;|]*)?[$#%](?=\s)(?:[^\\\r\n \t'"<$]|[ \t](?:(?!#)|#.*$)|\\(?:[^\r]|\r\n?)|\$(?!')|<(?!<)|"(?:\\[\s\S]|\$\([^)]+\)|\$(?!\()|`[^`]+`|[^"\\`$])*"|'[^']*'|\$'(?:[^'\\]|\\[\s\S])*'|<<-?\s*(["']?)(\w+)\1\s[\s\S]*?[\r\n]\2)+/m,
		greedy: true,
		inside: {
			'info': {
				// foo@bar:~/files$ exit
				// foo@bar$ exit
				// ~/files$ exit
				pattern: /^[^#$%]+/,
				alias: 'punctuation',
				inside: {
					'user': /^[^\s@:$#%*!/\\]+@[^\r\n@:$#%*!/\\]+/,
					'punctuation': /:/,
					'path': /[\s\S]+/
				}
			},
			'bash': {
				pattern: /(^[$#%]\s*)\S[\s\S]*/,
				lookbehind: true,
				alias: 'language-bash',
				inside: languages.bash
			},
			'shell-symbol': {
				pattern: /^[$#%]/,
				alias: 'important'
			}
		}
	},
	'output': /.(?:.*(?:[\r\n]|.$))*/
};
