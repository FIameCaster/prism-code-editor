import style1 from "../extensions/copyButton/copy.css?inline"
import style2 from "../extensions/folding/folding.css?inline"
import { indentGuides } from "../extensions/guides"
import { matchBrackets } from "../extensions/matchBrackets"
import { copyButton } from "../extensions/copyButton"
import { PrismEditor } from ".."
import { matchTags } from "../extensions/matchTags"
import { readOnlyCodeFolding } from "../extensions/folding"
import { highlightBracketPairs } from "../extensions/matchBrackets/highlight"
import { highlightSelectionMatches } from "../extensions/search"

export const addExtensions = (editor: PrismEditor) => {
	editor.addExtensions(
		matchBrackets(true),
		highlightBracketPairs(),
		highlightSelectionMatches(),
		matchTags(),
		indentGuides(),
		copyButton(),
		readOnlyCodeFolding(),
	)
}

export const style = style1 + style2
