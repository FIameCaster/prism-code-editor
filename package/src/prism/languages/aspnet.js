import { languages, rest } from '../core.js';
import { clone, insertBefore } from '../utils/language.js';
import './markup.js';
import './csharp.js';

var pageDirectiveInside = {
	'page-directive': {
		pattern: /<%\s*@\s*(?:assembly|control|implements|import|master(?:type)?|outputcache|page|previouspagetype|reference|register)?|%>/i,
		alias: 'tag'
	}
}

var aspnet = languages.aspnet = clone(languages.html);
var tag = aspnet.tag;

var directive = {
	pattern: /<%.*%>/,
	alias: 'tag',
	inside: {
		'directive': {
			pattern: /<%\s*?[$=%#:]{0,2}|%>/,
			alias: 'tag'
		},
		[rest]: 'cs'
	}
}

insertBefore(aspnet, 'markup-bracket', {
	'page-directive': {
		pattern: /<%\s*@.*%>/,
		alias: 'tag',
		inside: pageDirectiveInside
	},
	'directive': directive
})

pageDirectiveInside[rest] = tag.inside;

// Regexp copied from prism-markup, with a negative look-ahead added
tag.pattern = /<(?!%)\/?[^\s>/]+(?:\s+[^\s/=>]+(?:=(?:(["'])(?:\\[\s\S]|(?!\1)[^\\])*\1|[^\s'">=]+))?)*\s*\/?>/g;

// match directives of attribute value foo="<% Bar %>"
tag.inside['attr-value'][2].inside['directive'] = directive;

insertBefore(aspnet, 'comment', {
	'asp-comment': {
		pattern: /<%--[\s\S]*?--%>/,
		alias: 'asp comment'
	}
});

// script runat="server" contains csharp, not javascript
insertBefore(aspnet, aspnet.script ? 'script' : 'tag', {
	'asp-script': {
		pattern: /(<script(?=.*runat=["']?server\b)[^>]*>)(?!<\/script>)[\s\S]+?(?=<\/script>)/i,
		lookbehind: true,
		alias: 'asp script',
		inside: 'cs'
	}
});
