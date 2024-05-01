import { languages } from '../core.js';
import { entity, tag } from '../utils/xml-shared.js';

languages.rss = languages.atom = languages.ssml = languages.xml = {
	'comment': {
		pattern: /<!--(?:(?!<!--)[\s\S])*?-->/g,
		greedy: true
	},
	'prolog': {
		pattern: /<\?[\s\S]+?\?>/g,
		greedy: true
	},
	'doctype': {
		// https://www.w3.org/TR/xml/#NT-doctypedecl
		pattern: /<!DOCTYPE(?:[^>"'[\]]|"[^"]*"|'[^']*')+(?:\[(?:[^<"'\]]|"[^"]*"|'[^']*'|<(?!!--)|<!--(?:[^-]|-(?!->))*-->)*\]\s*)?>/gi,
		greedy: true,
		inside: {
			'internal-subset': {
				pattern: /(\[)[\s\S]+(?=\]\s*>$)/,
				lookbehind: true,
				inside: 'xml'
			},
			'string': /"[^"]*"|'[^']*'/,
			'punctuation': /^<!|[>[\]]/,
			'doctype-tag': /^DOCTYPE/i,
			'name': /\S+/
		}
	},
	'cdata': {
		pattern: /<!\[CDATA\[[\s\S]*?\]\]>/gi,
		greedy: true
	},
	'tag': tag,
	'entity': entity,
	'markup-bracket': {
		pattern: /[()[\]{}]/,
		alias: 'punctuation'
	}
};
