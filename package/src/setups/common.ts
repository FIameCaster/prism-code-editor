import "../languages"
import { bracketMatcher } from "../extensions/matchBrackets"
import { highlightBracketPairs } from "../extensions/matchBrackets/highlight"
import { indentGuides } from "../extensions/guides"
import { cursorPosition } from "../extensions/cursor"
import { defaultCommands } from "../extensions/commands"
import { PrismEditor } from ".."

export const addExtensions = (editor: PrismEditor) => {
	const cursor = cursorPosition()
	editor.addExtensions(
		defaultCommands(cursor),
		indentGuides(),
		bracketMatcher(true),
		highlightBracketPairs(),
		cursor,
	)
}
