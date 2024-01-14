import { languages } from '../core.js';
import { clone, extend } from '../utils/language.js';
import './jsx.js';
import './typescript.js';

var typescript = clone(languages.ts);
var tsx = languages.tsx = extend('jsx', typescript);
var tag = tsx.tag;
var bracket = '(?:^|(';

// doesn't work with TS because TS is too complex
delete tsx['parameter'];
delete tsx['literal-property'];

// This will prevent collisions between TSX tags and TS generic types.
// Idea by https://github.com/karlhorky
// Discussion: https://github.com/PrismJS/prism/issues/2594#issuecomment-710666928
try {
	RegExp('(?<=)');
	bracket += '?<=';
} catch {
	tag.lookbehind = true;
}
tag.pattern = RegExp(bracket + `[^\\w$])|(?=</))${tag.pattern.source}`, 'g');
