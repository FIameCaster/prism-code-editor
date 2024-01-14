import { Grammar, TokenStream } from "../types"

export declare const embeddedIn: (
	hostGrammar: Grammar | string,
) => (code: string, templateGrammar: Grammar) => TokenStream
