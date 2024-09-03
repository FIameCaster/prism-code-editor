import "../languages/index.js"
import { matchBrackets } from "../extensions/matchBrackets/index.js"
import { highlightBracketPairs } from "../extensions/matchBrackets/highlight.js"
import { indentGuides } from "../extensions/guides.js"
import { cursorPosition } from "../extensions/cursor.js"
import { defaultCommands, editHistory } from "../extensions/commands.js"
import { EditorExtension } from "../index.js"
import { highlightSelectionMatches } from "../extensions/search/selection.js"
import { searchWidget } from "../extensions/search/index.js"
import { matchTags } from "../extensions/matchTags.js"

export const basic = (history = editHistory()): EditorExtension[] => [
	defaultCommands(),
	indentGuides(),
	matchBrackets(),
	highlightBracketPairs(),
	cursorPosition(),
	highlightSelectionMatches(),
	searchWidget(),
	matchTags(),
	history,
	{
		update(editor) {
			if (editor.value != editor.textarea.value) history.clear()
		},
	},
]
