var clikeComment = () => ({
	pattern: /\/\/.*|\/\*[\s\S]*?(?:\*\/|$)/g,
	greedy: true
});

var clikeString = () => ({
	pattern: /(["'])(?:\\[\s\S]|(?!\1)[^\\\n])*\1/g,
	greedy: true
});

var clikeNumber = /\b0x[a-f\d]+\b|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[+-]?\d+)?/i;

var clikePunctuation = /[()[\]{}.,:;]/;

var boolean = /\b(?:false|true)\b/;

export { clikeComment, clikeString, clikeNumber, clikePunctuation, boolean }
