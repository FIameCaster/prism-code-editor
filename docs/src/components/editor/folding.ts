import "prism-code-editor/code-folding.css"
import { editors } from "./mount"
import "./extensions"
import {
	readOnlyCodeFolding,
	markdownFolding,
	blockCommentFolding,
	bracketFolding,
	tagFolding,
} from "prism-code-editor/code-folding"

editors.forEach(editor => {
	editor.addExtensions(
		readOnlyCodeFolding(bracketFolding, tagFolding, markdownFolding, blockCommentFolding),
	)
})
