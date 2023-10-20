// @ts-ignore
import _Prism from "prismjs/components/prism-core"
import { PrismType } from "."

/** 
 * Patched version of Prism with the following methods removed:
 * 
 * - `Prism.highlight`
 * - `Prism.highlightAll`
 * - `Prism.highlightAllUnder`
 * - `Prism.highlightElement`
 * - `Prism.Token.stringify`
 * - `Prism.util.objId`
 * - `Prism.util.encode`
 */
export const Prism = <PrismType>_Prism
export const languages = Prism.languages
export const insertBefore = languages.insertBefore
