import "../languages/index.js"
import { matchBrackets } from "../extensions/matchBrackets/index.js"
import { highlightBracketPairs } from "../extensions/matchBrackets/highlight.js"
import { indentGuides } from "../extensions/guides.js"
import { cursorPosition } from "../extensions/cursor.js"
import { defaultCommands } from "../extensions/commands.js"
import { PrismEditor } from "../index.js"

export const addExtensions = (editor: PrismEditor) => {
	editor.addExtensions(
		defaultCommands(),
		indentGuides(),
		matchBrackets(),
		highlightBracketPairs(),
		cursorPosition(),
	)
}
