import style from "../extensions/copyButton/copy.css?inline"
import { indentGuides } from "../extensions/guides"
import { matchBrackets } from "../extensions/matchBrackets"
import { copyButton } from "../extensions/copyButton"
import { PrismEditor } from ".."

export const addExtensions = (editor: PrismEditor) => {
	editor.addExtensions(matchBrackets(), indentGuides(), copyButton())
}

export { style }
