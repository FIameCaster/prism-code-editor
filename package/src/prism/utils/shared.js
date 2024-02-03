var clikeComment = () => ({
	pattern: /\/\/.*|\/\*[\s\S]*?(?:\*\/|$)/,
	greedy: true
});

var clikeString = () => ({
	pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
	greedy: true
});

var clikeNumber = /\b0x[\da-f]+\b|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[+-]?\d+)?/i;

var clikePunctuation = /[{}[\];(),.:]/;

var boolean = /\b(?:false|true)\b/;

export { clikeComment, clikeString, clikeNumber, boolean, clikePunctuation }
