import { defaultCommands, editHistory } from "./extensions/commands"
import { copyButton } from "./extensions/copy-button"
import { cursorPosition } from "./extensions/cursor"
import { blockCommentFolding, markdownFolding, readOnlyCodeFolding } from "./extensions/folding"
import { indentGuides } from "./extensions/guides"
import { matchBrackets } from "./extensions/match-brackets"
import { highlightBracketPairs } from "./extensions/match-brackets/highlight"
import { highlightMatchingTags, matchTags } from "./extensions/match-tags"
import { highlightSelectionMatches, searchWidget } from "./extensions/search"

/**
 * Array of extensions including:
 * - {@link matchBrackets}
 * - {@link highlightBracketPairs}
 * - {@link matchTags}
 * - {@link highlightMatchingTags}
 * - {@link defaultCommands}
 * - {@link editHistory}
 * - {@link searchWidget}
 * - {@link highlightSelectionMatches}
 * - {@link cursorPosition}
 * - {@link indentGuides}
 *
 * Requires styling from `solid-prism-editor/search.css` for the search widget
 */
const basicSetup = [
	/* @__PURE__ */ matchBrackets(),
	/* @__PURE__ */ highlightBracketPairs(),
	/* @__PURE__ */ matchTags(),
	/* @__PURE__ */ highlightMatchingTags(),
	/* @__PURE__ */ defaultCommands(),
	/* @__PURE__ */ editHistory(),
	/* @__PURE__ */ searchWidget(),
	/* @__PURE__ */ highlightSelectionMatches(),
	/* @__PURE__ */ cursorPosition(),
	/* @__PURE__ */ indentGuides(),
]

/**
 * Array of extensions including:
 * - {@link matchBrackets}
 * - {@link highlightBracketPairs}
 * - {@link matchTags}
 * - {@link highlightMatchingTags}
 * - {@link highlightSelectionMatches}
 * - {@link indentGuides}
 * - {@link copyButton}
 * - {@link readOnlyCodeFolding} with {@link blockCommentFolding} and {@link markdownFolding}
 *
 * Intended to be used with read-only editors.
 *
 * Requires styling from `solid-prism-editor/copy-button.css` for the copy button
 * and from `solid-prism-editor/folding.css` for the code folding.
 */
const readOnlySetup = [
	/* @__PURE__ */ matchBrackets(),
	/* @__PURE__ */ highlightBracketPairs(),
	/* @__PURE__ */ matchTags(),
	/* @__PURE__ */ highlightMatchingTags(),
	/* @__PURE__ */ highlightSelectionMatches(),
	/* @__PURE__ */ indentGuides(),
	/* @__PURE__ */ copyButton(),
	/* @__PURE__ */ readOnlyCodeFolding(blockCommentFolding, markdownFolding),
]

export { basicSetup, readOnlySetup }
