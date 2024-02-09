import { GrammarToken } from "../types";

export declare const clikeComment: () => GrammarToken;
export declare const clikeString: () => GrammarToken;
export declare const clikeNumber: RegExp;
export declare const clikePunctuation: RegExp;
export declare const boolean: RegExp;

/**
 * Replaces all placeholders "<<n>>" of given pattern with the n-th replacement (zero based).
 *
 * Note: This is a simple text based replacement. Be careful when using backreferences!
 *
 * @param pattern the given pattern.
 * @param replacements a list of replacement which can be inserted into the given pattern.
 * @returns the pattern with all placeholders replaced with their corresponding replacements.
 * @example replace(/a<<0>>a/.source, [/b+/.source]) === /a(?:b+)a/.source
 */
export declare const replace: (pattern: string, replacements: string[]) => string;

export declare const re: (pattern: string, replacements: string[], flags?: string) => RegExp;

/**
 * Creates a nested pattern where all occurrences of the string `<self>` are replaced with the pattern itself.
 *
 * @param pattern
 * @param depthLog2
 */
export declare const nested: (pattern: string, depthLog2: number) => string;
