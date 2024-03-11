import { searchWidget } from "../extensions/search/index.js"
import { matchTags } from "../extensions/matchTags.js"

export const full = () => [searchWidget(), matchTags()]
