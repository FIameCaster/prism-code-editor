import { languages } from '../core.js';
import { addJsxTag, space } from '../utils/jsx-shared.js';
import { insertBefore } from '../utils/language.js';
import { re } from '../utils/shared.js';
import './jsx.js';
import './typescript.js';

var tsx = addJsxTag(languages.ts, 'tsx');
var tag = tsx['tag'];
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
tag.pattern = RegExp(bracket + `[^\\w$])|(?=</))${
	tag.pattern.source.replace(space, space + `|(?:${space})*<(?:[^<>=]|=[^<]|=?<(?:[^<>]|<[^<>]*>)*>)*>`)
}`, 'g');

insertBefore(tag.inside, 'script', {
	'generic': {
		pattern: re(/(^<0>*)<(?:[^<>=]|=[^<]|=?<(?:[^<>]|<[^<>]*>)*>)*>/.source, [space]),
		lookbehind: true,
		alias: 'class-name',
		inside: tsx["class-name"].inside
	}
});
