export * from "./types"
export {
	createEditor,
	editorFromPlaceholder,
	isChrome,
	isMac,
	isWebKit,
	languages,
	setIgnoreTab,
	numLines,
	ignoreTab,
} from "./core"
export {
	regexEscape,
	getLineBefore,
	getLines,
	getClosestToken,
	getLanguage,
	insertText,
	getModifierCode,
} from "./utils"
