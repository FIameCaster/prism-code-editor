import { languages } from "../index.js"
import "./clike.js"

languages.css =
	languages.sass =
	languages.scss =
		{
			comments: {
				block: ["/*", "*/"],
			},
			autoIndent: languages.clike.autoIndent,
		}
