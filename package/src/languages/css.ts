import { languageMap } from "../core"
import { isBracketPair } from "./patterns"

languageMap.css =
	languageMap.sass =
	languageMap.scss =
		{
			comments: {
				block: ["/*", "*/"],
			},
			autoIndent: [
				([start], value) => /[([{][^\n)\]}]*$/.test(value.slice(0, start)),
				([start, end], value) => isBracketPair.test(value[start - 1] + value[end]),
			],
		}
