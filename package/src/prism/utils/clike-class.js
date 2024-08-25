var clikeClass = () => ({
	pattern: /(\b(?:class|extends|implements|instanceof|interface|new|trait)\s+|\bcatch\s+\()[\\\w.]+/i,
	lookbehind: true,
	inside: {
		'punctuation': /[\\.]/
	}
});

export { clikeClass }
