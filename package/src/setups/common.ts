import "../languages"
import { matchBrackets } from "../extensions/matchBrackets"
import { highlightBracketPairs } from "../extensions/matchBrackets/highlight"
import { indentGuides } from "../extensions/guides"
import { cursorPosition } from "../extensions/cursor"
import { defaultCommands } from "../extensions/commands"
import { PrismEditor } from ".."

export const addExtensions = (editor: PrismEditor) => {
	editor.addExtensions(
		defaultCommands(),
		indentGuides(),
		matchBrackets(),
		highlightBracketPairs(),
		cursorPosition(),
	)
}
