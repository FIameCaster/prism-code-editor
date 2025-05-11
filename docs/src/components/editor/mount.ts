import { mountEditorsUnder } from "prism-code-editor/client"
import { matchBrackets } from "prism-code-editor/match-brackets"

const editors = mountEditorsUnder<{ _pairs?: string }>(document, options => [
	matchBrackets(true, options._pairs),
])

export { editors }
