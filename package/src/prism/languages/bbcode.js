import { languages } from '../core.js';

languages.shortcode = languages.bbcode = {
	'tag': {
		pattern: /\[\/?[^\s=\]]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'"\]=]+))?(?:\s+[^\s=\]]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'"\]=]+))*\s*\]/,
		inside: {
			'punctuation': /^\[\/?|\]$/,
			'tag': /^[^\s=\]]+/,
			'attr-value': {
				pattern: /(=\s*)(?:"[^"]*"|'[^']*'|[^\s'"\]=]+)/,
				lookbehind: true,
				inside: {
					'punctuation': /^["']|["']$/,
				}
			},
			'attr-equals': /=/,
			'attr-name': /\S+/
		}
	}
};
