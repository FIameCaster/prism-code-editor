import { languages } from '../core.js';
import { insertBefore, clone } from '../utils/language.js';
import './cpp.js';

insertBefore(languages.cilk = languages['cilk-cpp'] = languages.cilkcpp = clone(languages.cpp), 'function', {
	'parallel-keyword': {
		pattern: /\bcilk_(?:for|reducer|s(?:cope|pawn|ync))\b/,
		alias: 'keyword'
	}
});
