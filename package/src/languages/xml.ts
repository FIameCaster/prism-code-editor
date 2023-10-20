import { languageMap } from "../core"
import { isBracketPair, xmlClosingTag, xmlOpeningTag } from "./patterns"

// Same as HTML, but without void tags
languageMap.xml =
	languageMap.ssml =
	languageMap.atom =
	languageMap.rss =
	languageMap.mathml =
	languageMap.svg =
		{
			comments: {
				block: ["<!--", "-->"],
			},
			autoIndent: [
				([start], value) =>
					xmlOpeningTag.test((value = value.substring(start - 999, start))) ||
					/[([{][^\n)\]}]*$/.test(value),
				([start, end], value) =>
					isBracketPair.test(value[start - 1] + value[end]) ||
					(xmlOpeningTag.test(value.substring(start - 999, start)) &&
						xmlClosingTag.test(value.slice(end, end + 999))),
			],
			autoCloseTags([start, end], value) {
				const tagName =
					start == end ? (value.substring(start - 999, start) + ">").match(xmlOpeningTag)?.[1] : ""
				return tagName ? `</${tagName}>` : ""
			},
		}
