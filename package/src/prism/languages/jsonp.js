import { languages } from '../core.js';
import { extend, insertBefore } from '../utils/language.js';
import './json.js';

insertBefore(languages.jsonp = extend('json', {
	'punctuation': /[{}[\]();,.]/
}), 'punctuation', {
	'function': /(?!\d)(?:(?!\s)[$\w\xA0-\uFFFF])+(?=\s*\()/
});
