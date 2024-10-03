import { highlightCurrentWord } from "prism-code-editor/search"
import { getClosestToken } from "prism-code-editor/utils"
import { editors } from "../editor/mount"

const selector = ".string, .comment, .keyword, .regex"

editors[2].addExtensions(
	highlightCurrentWord(pos => !getClosestToken(editors[2], selector, 0, 0, pos)),
)
;(document.querySelector(".btn") as HTMLButtonElement).onclick = () => {
	editors[3].extensions.searchWidget?.open()
}
