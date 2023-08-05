import { languages } from "../core"
import { xmlClosingTag, xmlOpeningTag } from "./patterns"

// Same as HTML, but without void tags
languages.xml =
	languages.ssml =
	languages.atom =
	languages.rss =
	languages.mathml =
	languages.svg =
		{
			comments: {
				block: ["<!--", "-->"],
			},
			autoIndent: [
				([start], value) => xmlOpeningTag.test(value.slice(0, start).slice(-999)),
				([start, end], value) =>
					xmlOpeningTag.test(value.slice(0, start).slice(-999)) &&
					xmlClosingTag.test(value.slice(end)),
			],
			autoCloseTags([start, end], value) {
				const tagName =
					start == end ? (value.slice(0, start).slice(-999) + ">").match(xmlOpeningTag)?.[1] : ""
				return tagName ? `</${tagName}>` : ""
			},
		}
