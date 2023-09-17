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
				([start], value) => xmlOpeningTag.test(value.substring(start - 999, start)),
				([start, end], value) =>
					xmlOpeningTag.test(value.substring(start - 999, start)) &&
					xmlClosingTag.test(value.slice(end, end + 999)),
			],
			autoCloseTags([start, end], value) {
				const tagName =
					start == end ? (value.substring(start - 999, start) + ">").match(xmlOpeningTag)?.[1] : ""
				return tagName ? `</${tagName}>` : ""
			},
		}
