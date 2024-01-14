import { languages } from '../core.js';
import { clikeComment } from '../utils/shared.js';

languages['nand2tetris-hdl'] = {
	'comment': clikeComment(),
	'keyword': /\b(?:BUILTIN|CHIP|CLOCKED|IN|OUT|PARTS)\b/,
	'boolean': /\b(?:false|true)\b/,
	'function': /\b[A-Za-z][A-Za-z0-9]*(?=\()/,
	'number': /\b\d+\b/,
	'operator': /=|\.\./,
	'punctuation': /[{}[\];(),:]/
};
