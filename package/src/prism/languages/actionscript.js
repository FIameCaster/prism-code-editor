import { languages, tokenize, withoutTokenizer } from '../core.js';
import { extend, insertBefore } from '../utils/language.js';
import { tag } from '../utils/xml-shared.js';
import './javascript.js';

var actionscript = languages.actionscript = extend('javascript', {
	'keyword': /\b(?:as|break|case|catch|class|const|default|delete|do|dynamic|each|else|extends|final|finally|for|function|[gs]et|if|implements|import|in|include|instanceof|interface|internal|is|namespace|native|new|null|override|package|private|protected|public|return|static|super|switch|this|throw|try|typeof|use|var|void|while|with)\b/,
	'operator': /--|\+\+|[!=]==|(?:&&|\|\||<<|>>>?|[%&|^!=<>/*+-])=?|[~?@]/
});
actionscript['class-name'].alias = 'function';

// doesn't work with AS because AS is too complex
delete actionscript['parameter'];
delete actionscript['literal-property'];

insertBefore(actionscript, 'regex', {
	'tag': tag
});
