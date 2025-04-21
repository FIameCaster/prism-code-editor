import { defaultCommands, editHistory } from "./extensions/commands"
import { copyButton } from "./extensions/copy-button"
import { cursorPosition } from "./extensions/cursor"
import {
	blockCommentFolding,
	bracketFolding,
	markdownFolding,
	readOnlyCodeFolding,
	tagFolding,
} from "./extensions/folding"
import { indentGuides } from "./extensions/guides"
import { matchBrackets } from "./extensions/match-brackets"
import { highlightBracketPairs } from "./extensions/match-brackets/highlight"
import { highlightMatchingTags, matchTags } from "./extensions/match-tags"
import { highlightSelectionMatches, searchWidget, showInvisibles } from "./extensions/search"

/**
 * Array of extensions including (in order):
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
 * - {@link showInvisibles}
 *
 * Requires styling from `solid-prism-editor/search.css` for the search widget.
 * To highlight selected spaces and tabs, import `solid-prism-editor/invisibles.css`.
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
	/* @__PURE__ */ showInvisibles(),
]

/**
 * Array of extensions including (in order):
 * - {@link matchBrackets}
 * - {@link highlightBracketPairs}
 * - {@link matchTags}
 * - {@link highlightMatchingTags}
 * - {@link highlightSelectionMatches}
 * - {@link indentGuides}
 * - {@link copyButton}
 * - {@link readOnlyCodeFolding} with {@link tagFolding}, {@link bracketFolding},
 * {@link blockCommentFolding}, and {@link markdownFolding}
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
	/* @__PURE__ */ readOnlyCodeFolding(
		tagFolding,
		bracketFolding,
		blockCommentFolding,
		markdownFolding,
	),
]

export { basicSetup, readOnlySetup }
