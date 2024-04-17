import { languages } from '../core.js';
import { extend, insertBefore } from '../utils/language.js';
import { clikePunctuation } from '../utils/patterns.js';
import './json.js';

insertBefore(languages.jsonp = extend('json', {
	'punctuation': clikePunctuation
}), 'punctuation', {
	'function': /(?!\d)(?:(?!\s)[$\w\xa0-\uffff])+(?=\s*\()/
});
