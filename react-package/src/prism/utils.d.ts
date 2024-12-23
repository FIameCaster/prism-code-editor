import type { CustomTokenizer, Grammar, GrammarTokens, TokenName } from "./index.js"

/**
 * Creates a deep clone of the given grammar definition.
 * @param grammar Grammar object you want to clone.
 */
export declare const clone: (grammar: Grammar) => Grammar

/**
 * Inserts tokens _before_ another token in the given grammar.
 *
 * ## Usage
 *
 * This helper method makes it easy to modify existing grammars. For example, the markup language definition
 * defines highlighting for CSS embedded in HTML through `<style>` elements. To do this, it needs to modify
 * `languages.markup` and add the appropriate tokens. However, `languages.markup` is a regular JavaScript
 * object literal, so if you do this:
 *
 * ```js
 * markup.style = {
 *     // token
 * };
 * ```
 *
 * then the `style` token will be added (and processed) at the end. `insertBefore` allows you to insert tokens
 * before existing tokens. For the markup example above, you would use it like this:
 *
 * ```js
 * insertBefore(markup, 'cdata', {
 *   'style': {
 *     // token
 *   }
 * });
 * ```
 *
 * ## Special cases
 *
 * If the grammars of `grammar` and `insert` have tokens with the same name, the tokens in `grammar`'s grammar
 * will be ignored.
 *
 * This behavior can be used to insert tokens after `before`:
 *
 * ```js
 * insertBefore(markup, 'comment', {
 *   'comment': markup.comment,
 *   // tokens after 'comment'
 * });
 * ```
 *
 * @param grammar The grammar to be modified.
 * @param before The key to insert before.
 * @param insert An object containing the key-value pairs to be inserted.
 */
export declare const insertBefore: (
	grammar: Grammar,
	before: TokenName,
	insert: GrammarTokens,
) => void

/**
 * Creates a deep copy of the language with the given id and appends the given tokens.
 *
 * If a token in `reDef` also appears in the copied language, then the existing token in the copied language
 * will be overwritten at its original position.
 *
 * ## Best practices
 *
 * Since the position of overwriting tokens (token in `reDef` that overwrite tokens in the copied language)
 * doesn't matter, they can technically be in any order. However, this can be confusing to others that trying to
 * understand the language definition because, normally, the order of tokens matters in Prism grammars.
 *
 * Therefore, it is encouraged to order overwriting tokens according to the positions of the overwritten tokens.
 * Furthermore, all non-overwriting tokens should be placed after the overwriting ones.
 *
 * @param id The id of the language to extend.
 * @param reDef The new tokens to append.
 * @returns The new language created.
 * @example
 * languages['css-with-colors'] = extend('css', {
 *   // languages.css already has a 'comment' token, so this token will overwrite CSS' 'comment' token
 *   // at its original position
 *   'comment': { ... },
 *   // CSS doesn't have a 'color' token, so this token will be appended
 *   'color': /\b(?:red|green|blue)\b/
 * });
 */
export declare const extend: (id: string, reDef?: Grammar) => Grammar

/**
 * Custom tokenizer for languages that are embedded in another language.
 * 
 * This works by first tokenizing everything using the grammar of the embedded language.
 * Then, all tokens whoose name doesn't start with `ignore` are replaced with whitespace
 * of the same length. This new string is then tokenized using `hostGrammar`, and all the
 * replaced tokens are inserted into the new token stream.
 * 
 * @param hostGrammar The grammar this language is embedded in. Can either be a grammar object
 * or the id of a grammar.
 */
export declare const embeddedIn: (hostGrammar: Grammar | string) => CustomTokenizer
