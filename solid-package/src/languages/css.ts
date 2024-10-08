import { languageMap } from "../core"
import { bracketIndenting, clikeComment } from "./shared"

languageMap.css = bracketIndenting({
	block: ["/*", "*/"],
})

languageMap.less = languageMap.scss = bracketIndenting()

languageMap.sass = {
	comments: clikeComment,
	// Let's not bother with auto-indenting for sass
}
