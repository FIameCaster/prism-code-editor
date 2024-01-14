var clikeComment = () => ({
	pattern: /\/\/.*|\/\*[\s\S]*?(?:\*\/|$)/,
	greedy: true
});

var clikeString = () => ({
	pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
	greedy: true
});

export { clikeComment, clikeString }
