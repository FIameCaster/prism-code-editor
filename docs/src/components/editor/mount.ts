import { mountEditorsUnder } from "prism-code-editor/client"
import { matchBrackets } from "prism-code-editor/match-brackets"
import { indentGuides } from "prism-code-editor/guides"

const editors = mountEditorsUnder(document, () => [matchBrackets(), indentGuides()])

export { editors }
