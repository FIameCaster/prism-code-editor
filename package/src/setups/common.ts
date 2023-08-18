import "../languages"
import { matchBrackets } from "../extensions/matchBrackets"
import { indentGuides } from "../extensions/guides"
import { cursorPosition } from "../extensions/cursor"
import { defaultCommands } from "../extensions/commands"
import { PrismEditor } from ".."

export const addExtensions = (editor: PrismEditor) => {
	const cursor = cursorPosition()
	editor.addExtensions(
		defaultCommands(cursor),
		matchBrackets(),
		indentGuides(),
		cursor,
	)
}
