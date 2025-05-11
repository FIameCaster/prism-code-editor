import { languageMap } from "../core"
import { getClosestToken } from "../utils"
import { markupLanguage } from "./shared"

const comment: [string, string] = ["(:", ":)"]

const xquery = (languageMap.xquery = markupLanguage(
	{ block: comment },
	/<(?!!|\d)([^\s/=>$<%]+)(?:\s+[^\s/=>]+(?:\s*=\s*(["'])(?:\{\{|\{(?!\{)(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})*\}|(?!\2)[^{])*\2)?)*\s*>[ \t]*$/,
))

xquery.getComments = (editor, position) => ({
	block: getClosestToken(editor, ".plain-text", 0, 0, position) ? ["{(:", ":)}"] : comment,
})
