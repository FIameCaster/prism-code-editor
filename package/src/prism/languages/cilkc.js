import { languages } from '../core.js';
import { clone, insertBefore } from '../utils/language.js';
import './c.js';

insertBefore(languages['cilk-c'] = languages.cilkc = clone(languages.c), 'function', {
	'parallel-keyword': {
		pattern: /\bcilk_(?:for|reducer|s(?:cope|pawn|ync))\b/,
		alias: 'keyword'
	}
});
