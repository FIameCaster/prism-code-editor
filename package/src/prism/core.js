/**
 * Prism: Lightweight, robust, elegant syntax highlighting
 *
 * @license MIT <https://opensource.org/licenses/MIT>
 * @author Lea Verou <https://lea.verou.me>
 */

var plainTextGrammar = {};
var rest = Symbol();
var tokenize = Symbol();

var resolve = id => typeof id == 'string' ? languages[id] : id;

var languages = {
	plain: plainTextGrammar,
	plaintext: plainTextGrammar,
	text: plainTextGrammar,
	txt: plainTextGrammar,
};

/**
 * @param {string} text 
 * @param {any} grammar 
 */
var tokenizeText = (text, grammar) => (grammar[tokenize] || withoutTokenizer)(text, grammar);

/**
 * @param {string} text 
 * @param {any} grammar 
 */
var withoutTokenizer = (text, grammar) => {
	var head = {};
	var tail = { prev: head };
	var tokenList = {
		head, tail, length: 0
	};
	var restGrammar = resolve(grammar[rest]);
	var array = [], i = 0;
	head.next = tail;
	if (restGrammar) {
		Object.assign(grammar, restGrammar);
		delete grammar[rest];
	}

	addAfter(tokenList, head, text);
	matchGrammar(text, tokenList, grammar, head, 0);
	
	while ((head = head.next) != tail) {
		array[i++] = head.value;
	}
	return array;
}

var closingTag = "</span>";
var openingTags;
var closingTags;

var stringifyAll = tokens => {
	var str = "", l = tokens.length, i = 0;
	while (i < l) str += stringify(tokens[i++]);
	return str;
}

/** @param {string | Token | (string | Token)[]} token */
var stringify = token => {
	if (token instanceof Token) {
		var { type, alias, content } = token;
		var prevOpening = openingTags;
		var prevClosing = closingTags;
		var opening = `<span class="token ${
			type + (alias ? " " + alias : "") + (type == 'keyword' ? " keyword-" + content : "")
		}">`;

		closingTags += closingTag;
		openingTags += opening;
		var contentStr = stringify(content);
		openingTags = prevOpening;
		closingTags = prevClosing;
		return opening + contentStr + closingTag;
	}

	if (typeof token != 'string') return stringifyAll(token);

	token = token.replace(/&/g, "&amp;").replace(/</g, "&lt;");
	if (closingTags && token.includes("\n")) {
		return token.replace(/\n/g, closingTags + "\n" + openingTags);
	}
	return token;
}

var highlightTokens = tokens => {
	openingTags = "";
	closingTags = "";
	return stringifyAll(tokens);
}

var highlight = (text, ref) => highlightTokens(tokenizeText(text, resolve(ref)));

/**
 * @param {RegExp} pattern
 * @param {string} text
 * @param {boolean} lookbehind
 * @param {number} pos
 * @returns {RegExpExecArray | null}
 */
var matchPattern = (pattern, text, lookbehind, pos) => {
	pattern.lastIndex = pos;
	var match = pattern.exec(text);
	if (match && lookbehind && match[1]) {
		// change the match to remove the text matched by the Prism lookbehind group
		var lookbehindLength = match[1].length;
		match.index += lookbehindLength;
		match[0] = match[0].slice(lookbehindLength);
	}
	return match;
}

/**
 * @typedef LinkedListNode
 * @property {string | Token} value
 * @property {LinkedListNode | null} prev The previous node.
 * @property {LinkedListNode | null} next The next node.
 */

/**
 * @typedef LinkedList
 * @property {LinkedListNode | null} head
 * @property {LinkedListNode | null} tail
 * @property {number} length
 */

/**
 * @param {string} text
 * @param {LinkedList} tokenList
 * @param {any} grammar
 * @param {LinkedListNode} startNode
 * @param {number} startPos
 * @param {RematchOptions} [rematch]
 * @returns {void}
 * @private
 *
 * @typedef {{ t: string, i: number, r: number }} RematchOptions
 */
var matchGrammar = (text, tokenList, grammar, startNode, startPos, rematch) => {
	for (var token in grammar) {
		if (grammar[token]) for (var j = 0, p = grammar[token], patterns = Array.isArray(p) ? p : [p]; j < patterns.length; ++j) {
			if (rematch && rematch.i == j && rematch.t == token) {
				return;
			}

			var patternObj = patterns[j];
			var inside = resolve(patternObj.inside);
			var lookbehind = patternObj.lookbehind;
			var greedy = patternObj.greedy;
			var alias = patternObj.alias;

			/** @type {RegExp} */
			var pattern = patternObj.pattern || patternObj;
			if (greedy && !pattern.global) {
				// Without the global flag, lastIndex won't work
				pattern = patternObj.pattern = RegExp(pattern.source, 'g' + pattern.flags);
			}
			
			for ( // iterate the token list and keep track of the current token/string position
				var currentNode = startNode.next, pos = startPos;
				currentNode != tokenList.tail && (!rematch || pos < rematch.r);
				pos += currentNode.value.length, currentNode = currentNode.next
			) {
				var str = currentNode.value;

				if (tokenList.length > text.length) {
					// Something went terribly wrong, ABORT, ABORT!
					return;
				}

				if (str instanceof Token) {
					continue;
				}

				var removeCount = 1; // this is the to parameter of removeBetween
				var match;

				if (greedy) {
					match = matchPattern(pattern, text, lookbehind, pos);
					if (!match || match.index >= text.length) {
						break;
					}

					var from = match.index;
					var to = from + match[0].length;

					// find the node that contains the match
					while (from >= (pos += currentNode.value.length)) {
						currentNode = currentNode.next;
					}
					// adjust pos
					pos -= currentNode.value.length;

					// the current node is a Token, then the match starts inside another Token, which is invalid
					if (currentNode.value instanceof Token) {
						continue;
					}

					// find the last node which is affected by this match
					for (
						var k = currentNode, p = pos;
						k != tokenList.tail && (p < to || typeof k.value == 'string');
						k = k.next
					) {
						removeCount++;
						p += k.value.length;
					}
					removeCount--;

					// replace with the new match
					str = text.slice(pos, p);
					match.index -= pos;
				} else {
					match = matchPattern(pattern, str, lookbehind, 0);
					if (!match) {
						continue;
					}
				}

				// eslint-disable-next-line no-redeclare
				var from = match.index;
				var matchStr = match[0];
				var before = str.slice(0, from);
				var after = str.slice(from + matchStr.length);
				var reach = pos + str.length;
				var removeFrom = currentNode.prev;

				if (rematch && reach > rematch.r) {
					rematch.r = reach;
				}

				if (before) {
					removeFrom = addAfter(tokenList, removeFrom, before);
					pos += before.length;
				}

				var next = removeFrom.next, i = 0;
				for (; i < removeCount && next != tokenList.tail; i++) {
					next = next.next;
				}
				removeFrom.next = next;
				next.prev = removeFrom;
				tokenList.length -= i;
				
				currentNode = addAfter(
					tokenList,
					removeFrom,
					new Token(token, inside ? tokenizeText(matchStr, inside) : matchStr, matchStr, alias)
				);

				if (after) {
					addAfter(tokenList, currentNode, after);
				}

				if (removeCount > 1) {
					// at least one Token object was removed, so we have to do some rematching
					// this can only happen if the current pattern is greedy

					/** @type {RematchOptions} */
					var nestedRematch = {t: token, i: j, r: reach};
					matchGrammar(text, tokenList, grammar, currentNode.prev, pos, nestedRematch);

					// the reach might have been extended because of the rematching
					if (rematch && nestedRematch.r > rematch.r) {
						rematch.r = nestedRematch.r;
					}
				}
			}
		}
	}
}

/**
 * Adds a new node with the given value to the list.
 *
 * @param {LinkedList} list
 * @param {LinkedListNode} node
 * @param {string | Token} value
 * @returns {LinkedListNode} The added node.
 */
var addAfter = (list, node, value) => {
	// assumes that node != list.tail && values.length >= 0
	var next = node.next;
	list.length++;
	return node.next = next.prev = { value, prev: node, next };
}

/**
 * Creates a new token.
 *
 * @param {string} type
 * @param {string | any[]} content
 * @param {string} matchedStr
 * @param {string} alias
 * @class
 */
function Token(type, content, matchedStr, alias) {
	this.type = type;
	this.content = content;
	this.alias = alias;
	this.length = matchedStr.length;
}

export {
	rest,
	tokenize,
	Token,
	languages,
	tokenizeText,
	withoutTokenizer,
	resolve,
	highlightTokens,
	highlight
}
