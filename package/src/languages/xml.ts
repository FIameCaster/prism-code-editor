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
					xmlOpeningTag.test((value = value.slice(0, start))) ||
					/[([{][^\n)\]}]*$/.test(value),
				([start, end], value) =>
					isBracketPair.test(value[start - 1] + value[end]) ||
					(xmlOpeningTag.test(value.slice(0, start)) &&
						xmlClosingTag.test(value.slice(end))),
			],
			autoCloseTags([start, end], value) {
				const match =
					start == end && (value.slice(0, start) + ">").match(xmlOpeningTag)
				return match ? `</${match[1]}>` : ""
			},
		}
