import { mountEditorsUnder } from "prism-code-editor/client"
import { matchBrackets } from "prism-code-editor/match-brackets"

const editors = mountEditorsUnder(document, () => [matchBrackets()])

export { editors }
