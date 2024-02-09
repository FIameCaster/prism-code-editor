import { languages } from '../core.js';

// https://tools.ietf.org/html/rfc4180

languages.csv = {
	'value': /[^\n,"]+|"(?:[^"]|"")*"(?!")/,
	'punctuation': /,/
};
