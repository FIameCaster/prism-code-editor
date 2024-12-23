import { getClosestToken } from "../utils"
import { markupTemplateLang } from "./shared"

markupTemplateLang("tt2", {
	block: ["[%#", "%]"],
}).getComments = (editor, position) => ({
	line: getClosestToken(editor, ".tt2", 0, 0, position) && "#",
	block: ["[%#", "%]"],
})
