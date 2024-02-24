import "../languages/index.js"
import style1 from "../extensions/copyButton/copy.css?inline"
import style2 from "../extensions/folding/folding.css?inline"
import { indentGuides } from "../extensions/guides.js"
import { matchBrackets } from "../extensions/matchBrackets/index.js"
import { copyButton } from "../extensions/copyButton/index.js"
import { PrismEditor } from "../index.js"
import { matchTags } from "../extensions/matchTags.js"
import { blockCommentFolding, markdownFolding, readOnlyCodeFolding } from "../extensions/folding/index.js"
import { highlightBracketPairs } from "../extensions/matchBrackets/highlight.js"
import { highlightSelectionMatches } from "../extensions/search/selection.js"

export const addExtensions = (editor: PrismEditor) => {
	editor.addExtensions(
		matchBrackets(),
		highlightBracketPairs(),
		highlightSelectionMatches(),
		matchTags(),
		indentGuides(),
		copyButton(),
		readOnlyCodeFolding(markdownFolding, blockCommentFolding),
	)
}

export const style = style1 + style2
