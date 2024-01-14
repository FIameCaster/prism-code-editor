import { tokenizeText, Token, resolve, withoutTokenizer } from "../core.js"

var getPlaceholder = id => `___PH${id}___`;

var embeddedIn = hostGrammar => (code, templateGrammar) => {
	var host = resolve(hostGrammar);
	var hostCode = code
	var tokenStack = [];

	if (templateGrammar) {
		hostCode = '';
		var templateTokens = withoutTokenizer(code, templateGrammar);
		var hasPlaceholderLike = /___PH\d+___/.test(code);
		var id = 0, i = 0, l = templateTokens.length, position = 0;

		while (i < l) {
			var token = templateTokens[i++];
			var length = token.length;
			var type = token.type;
			if (!type || type.slice(0, 6) == 'ignore') {
				hostCode += code.slice(position, position + length);
			}
			else {
				if (hasPlaceholderLike) {
					while (code.includes(getPlaceholder(id))) id++;
				}
				tokenStack.push([id, token]);
				hostCode += getPlaceholder(id++);
			}
			position += length;
		}
	}

	var j = 0;
	var l = tokenStack.length;
	var parents = [];
	var p = 0;
	/** @param {(string | Token)[]} tokens */
	var walkTokens = tokens => {
		for (var i = 0; j < l && i < tokens.length; i++) {
			var token = tokens[i];
			var content = token.content;

			if (content) parents[p++] = token;
			if (Array.isArray(content)) {
				walkTokens(content);
			} else {
				var [id, t] = tokenStack[j];
				var s = content || token;
				var placeholder = getPlaceholder(id);
				
				var index = s.indexOf(placeholder);
				if (index + 1) {
					++j;
					
					var replacement = [t];
					var len = placeholder.length;
					var after = s.slice(index + len);
					var k = 0;
					if (index) replacement.unshift(s.slice(0, index));
					if (after) replacement.push(...walkTokens([after]));
					while (k < p) parents[k++].length += t.length - len;
					
					if (content) {
						token.content = replacement;
					} else {
						tokens.splice(i, 1, ...replacement);
					}
				}
			}
			if (content) p--;
		}

		return tokens;
	}

	return walkTokens(host ? tokenizeText(hostCode, host) : [hostCode]);
}

export { embeddedIn }
