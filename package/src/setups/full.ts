import { highlightSelectionMatches, searchWidget } from "../extensions/search/index.js"
import { matchTags } from "../extensions/matchTags.js"

export const full = () => [highlightSelectionMatches(), searchWidget(), matchTags()]
