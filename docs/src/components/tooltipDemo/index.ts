import { addTooltip } from "prism-code-editor/tooltips"
import { editors } from "../editor/mount"

const editor = editors[0]
const textarea = editor.textarea
const tooltip = document.createElement("div")
const [show, hide] = addTooltip(editor, tooltip, false)
tooltip.className = "my-tooltip"
tooltip.textContent = "Cannot edit read-only editor."

textarea.addEventListener("beforeinput", () => show(), true)
editor.on("selectionChange", hide)
textarea.addEventListener("click", hide)
