import { tokenize } from ".."
import { CustomTokenizer, Grammar, TokenStream } from "../types"

/**
 * Custom tokenizer for languages that are embedded in other languages.
 * 
 * This works by first tokenizing everything using the grammar of the embedded language.
 * Then, all tokens whoose name doesn't start with `ignore` are replaced by a template
 * placeholder. This new string with placeholders is then tokenized using `hostGrammar`.
 * Lastly, this token stream is searched and each placeholder is replaced by its matching token.
 * 
 * ### Note
 * 
 * Placeholders look like `___PH0___`, `___PH1___`, etc. `hostGrammar` must not be able to match part
 * of these placeholders, since this will break the embedding.
 * 
 * @param hostGrammar The grammar this grammar is embedded in. Can either be a grammar object
 * or the id of a grammar.
 */
export declare const embeddedIn: (hostGrammar: Grammar | string) => CustomTokenizer
