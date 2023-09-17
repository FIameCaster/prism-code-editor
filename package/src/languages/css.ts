import { languages } from "../core"
import { isBracketPair } from "./patterns"

languages.css =
	languages.sass =
	languages.scss =
		{
			comments: {
				block: ["/*", "*/"],
			},
			autoIndent: [
				([start], value) => /[([{][^\n)\]}]*$/.test(value.substring(start - 999, start)),
				([start, end], value) => isBracketPair.test(value[start - 1] + value[end]),
			],
		}
