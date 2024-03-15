import { tokenizeText, Token, resolve, withoutTokenizer } from "../core.js";

var embeddedIn = hostGrammar => (code, templateGrammar) => {
	var host = resolve(hostGrammar);
	var hostCode = '';
	var tokenStack = [];
	var stackLength = 0;
	var templateTokens = withoutTokenizer(code, templateGrammar);
	var i = 0, l = templateTokens.length, position = 0;

	while (i < l) {
		var token = templateTokens[i++];
		var length = token.length;
		var type = token.type;
		if (type && type.slice(0, 6) != 'ignore') {
			tokenStack[stackLength++] = [position, token];
			hostCode += ' '.repeat(length);
		}
		else {
			hostCode += code.slice(position, position + length);
		}
		position += length;
	}

	var j = 0;
	var position = 0;

	/** @param {(string | Token)[]} tokens */
	var walkTokens = tokens => {
		for (var i = 0; j < stackLength && i < tokens.length; i++) {
			var token = tokens[i];
			var content = token.content;
			
			if (Array.isArray(content)) {
				walkTokens(content);
			} else {
				var length = token.length;
				var replacement = [];
				var offset, t, k = 0;
				var pos = position;

				while ([offset, t] = tokenStack[j], offset >= position && offset < position + length) {
					if (pos < offset) replacement[k++] = hostCode.slice(pos, offset);
					pos = offset + t.length;
					replacement[k++] = t;
					if (++j == stackLength) break;
				}
				position += length;
				
				if (k) {
					if (pos < position) replacement[k++] = hostCode.slice(pos, position);
					if (content) {
						token.content = replacement;
					} else {
						tokens.splice(i, 1, ...replacement);
						i += k - 1;
					}
				}
			}
		}
	}

	var tokens = host ? tokenizeText(hostCode, host) : [hostCode];
	walkTokens(tokens);

	return tokens;
}

export { embeddedIn }
