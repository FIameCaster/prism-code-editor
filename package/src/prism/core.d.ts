import type { Grammar, TokenName, TokenStream, GrammarToken } from "./types"

export declare const rest: unique symbol
export declare const tokenize: unique symbol

export declare class Token {
	/**
	 * The type of the token.
	 *
	 * This is usually the key of a pattern in a {@link Grammar}.
	 *
	 * @see {@link GrammarToken}
	 */

	type: TokenName;
	/**
	 * The strings or tokens contained by this token.
	 *
	 * This will be a token stream if the pattern matched also defined an `inside` grammar.
	 */
	content: string | TokenStream;
	
	/** Length of the full string this token was created from. */
	length: number;
	
	/**
	 * The alias(es) of the token.
	 * Multiple aliases are separated by spaces.
	 *
	 * @see {@link GrammarToken#alias}
	 */
	alias?: TokenName

	/**
	 * Creates a new token.
	 *
	 * @param type See {@link Token#type}
	 * @param content See {@link Token#content}
	 * @param alias The alias(es) of the token.
	 * @param matchedStr A copy of the full string this token was created from.
	 * @public
	 */
	constructor(type: TokenName, content: string | TokenStream, alias?: TokenName, matchedStr?: string)
}

/**
 * This record contains all currently loaded languages in Prism.
 */
export declare const languages: Record<string, Grammar>

/**
 * This is the heart of Prism, and the most low-level function you can use. It accepts a string of text as input
 * and the language definitions to use, and returns an array with the tokenized code.
 *
 * When the language definition includes nested tokens, the function is called recursively on each of these tokens.
 *
 * This method could be useful in other contexts as well, as a very crude parser.
 *
 * @param text A string with the code to be highlighted.
 * @param grammar An object containing the tokens to use.
 *
 * Usually a language definition like `languages.markup`.
 * @returns An array of strings and tokens, a token stream.
 * @example
 * let code = `var foo = 0;`;
 * let tokens = tokenizeText(code, languages.javascript);
 * tokens.forEach(token => {
 *     if (token instanceof Token && token.type == 'number') {
 *         console.log(`Found numeric literal: ${token.content}`);
 *     }
 * });
 */
export declare const tokenizeText: (text: string, grammar: Grammar) => TokenStream

export declare const withoutTokenizer: (text: string, grammar: Grammar) => TokenStream

export declare const highlightTokens: (tokens: TokenStream) => string

export declare const highlight: (text: string, ref: Grammar | string) => string

export declare const resolve: (ref: string | null | undefined | Grammar) => Grammar | undefined
