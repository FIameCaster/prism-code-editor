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
				([start], value) => /[([{][^\n)\]}]*$/.test(value.slice(0, start).slice(-999)),
				([start, end], value) => isBracketPair.test(value[start - 1] + value[end]),
			],
		}
