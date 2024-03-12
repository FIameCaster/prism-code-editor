import { languages } from '../core.js';
import { addJsxTag } from '../utils/jsx-shared.js';
import './jsx.js';
import './typescript.js';

addJsxTag(languages.ts, 'tsx');

var tag = languages.tsx.tag;
var bracket = '(?:^|(';

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
