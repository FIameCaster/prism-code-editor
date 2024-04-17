import { languages } from '../core.js';
import { clikeComment, clikeString, clikeNumber, boolean, clikePunctuation } from '../utils/patterns.js';

languages.clike = {
	'comment': clikeComment(),
	'string': clikeString(),
	'class-name': {
		pattern: /(\b(?:class|extends|implements|instanceof|interface|new|trait)\s+|\bcatch\s+\()[\w.\\]+/i,
		lookbehind: true,
		inside: {
			'punctuation': /[.\\]/
		}
	},
	'keyword': /\b(?:break|catch|continue|do|else|finally|for|function|if|in|instanceof|new|null|return|throw|try|while)\b/,
	'boolean': boolean,
	'function': /\b\w+(?=\()/,
	'number': clikeNumber,
	'operator': /[!=]==|[!=<>]=?|--?|\+\+?|&&?|\|\|?|[?*/~^%]/,
	'punctuation': clikePunctuation
};
