import { useDefaultCommands, useEditHistory } from "./extensions/commands"
import { useCursorPosition } from "./extensions/cursor"
import { IndentGuides } from "./extensions/guides"
import { useBracketMatcher } from "./extensions/match-brackets"
import { useHightlightBracketPairs } from "./extensions/match-brackets/highlight"
import { useHighlightMatchingTags, useTagMatcher } from "./extensions/match-tags"
import { useHighlightSelectionMatches, useSearchWidget } from "./extensions/search"
import { blockCommentFolding, markdownFolding, useReadOnlyCodeFolding } from "./extensions/folding"
import { useCopyButton } from "./extensions/copy-button"
import { PrismEditor } from "./types"

/**
 * Component adding the following extensions:
 * - {@link useBracketMatcher}
 * - {@link useHightlightBracketPairs}
 * - {@link useTagMatcher}
 * - {@link useHighlightMatchingTags}
 * - {@link useDefaultCommands}
 * - {@link useEditHistory}
 * - {@link useSearchWidget}
 * - {@link useHighlightSelectionMatches}
 * - {@link useCursorPosition}
 * - {@link IndentGuides}
 * 
 * Requires styling from `prism-react-editor/search.css` for the search widget
 */
const BasicSetup = ({ editor }: { editor: PrismEditor }) => {
	useBracketMatcher(editor)
	useHightlightBracketPairs(editor)
	useTagMatcher(editor)
	useHighlightMatchingTags(editor)
	useDefaultCommands(editor)
	useEditHistory(editor)
	useSearchWidget(editor)
	useHighlightSelectionMatches(editor)
	useCursorPosition(editor)

	return <IndentGuides editor={editor} />
}

/**
 * Component adding the following extensions:
 * - {@link useBracketMatcher}
 * - {@link useHightlightBracketPairs}
 * - {@link useTagMatcher}
 * - {@link useHighlightMatchingTags}
 * - {@link useHighlightSelectionMatches}
 * - {@link IndentGuides}
 * - {@link useCopyButton}
 * - {@link useReadOnlyCodeFolding} with {@link blockCommentFolding} and {@link markdownFolding}
 * 
 * Intended to be used with read-only editors.
 * 
 * Requires styling from `prism-react-editor/copy-button.css` for the copy button
 * and from `prism-react-editor/code-folding.css` for the code folding.
 */
const ReadOnlySetup = ({ editor }: { editor: PrismEditor }) => {
	useBracketMatcher(editor)
	useHightlightBracketPairs(editor)
	useTagMatcher(editor)
	useHighlightMatchingTags(editor)
	useHighlightSelectionMatches(editor)
	useCopyButton(editor)
	useReadOnlyCodeFolding(editor, blockCommentFolding, markdownFolding)

	return <IndentGuides editor={editor} />
}

export { BasicSetup, ReadOnlySetup }
