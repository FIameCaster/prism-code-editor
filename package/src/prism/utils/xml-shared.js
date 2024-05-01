var entity = [
	{
		pattern: /&[a-z\d]{1,8};/i,
		alias: 'named-entity'
	},
	/&#x?[a-f\d]{1,8};/i
];

var tag = {
	pattern: /<\/?(?!\d)[^\s/=>$<%]+(?:\s(?:\s*[^\s/=>]+(?:\s*=\s*(?!\s)(?:"[^"]*"|'[^']*'|[^\s"'=>]+(?=[\s>]))?|(?=[\s/>])))+)?\s*\/?>/g,
	greedy: true,
	inside: {
		'punctuation': /^<\/?|\/?>$/,
		'tag': {
			pattern: /^\S+/,
			inside: {
				'namespace': /^[^:]+:/
			}
		},
		'attr-value': [{
			pattern: /(=\s*)(?:"[^"]*"|'[^']*'|[^\s"'=>]+)/g,
			lookbehind: true,
			greedy: true,
			inside: {
				'punctuation': /^["']|["']$/,
				entity
			}
		}],
		'attr-equals': /=/,
		'attr-name': {
			pattern: /\S+/,
			inside: {
				'namespace': /^[^:]+:/
			}
		}
	}
};

export { entity, tag }
