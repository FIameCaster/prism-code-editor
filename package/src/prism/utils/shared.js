var clikeComment = () => ({
	pattern: /\/\/.*|\/\*[\s\S]*?(?:\*\/|$)/g,
	greedy: true
});

var clikeString = () => ({
	pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/g,
	greedy: true
});

var clikeNumber = /\b0x[a-f\d]+\b|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[+-]?\d+)?/i;

var clikePunctuation = /[()[\]{}.,:;]/;

var boolean = /\b(?:false|true)\b/;

var nested = (pattern, depthLog2) => {
	for (var i = 0; i < depthLog2; i++) {
		pattern = pattern.replace(/<self>/g, `(?:${pattern})`);
	}
	return pattern.replace(/<self>/g, '[]');
}

var replace = (pattern, replacements) =>
	pattern.replace(/<(\d+)>/g, (m, index) => `(?:${replacements[+index]})`);

var re = (pattern, replacements, flags) => RegExp(replace(pattern, replacements), flags);

export { clikeComment, clikeString, clikeNumber, boolean, clikePunctuation, nested, replace, re }
