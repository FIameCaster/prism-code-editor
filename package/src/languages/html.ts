import { languageMap } from "../core"
import { isBracketPair, xmlClosingTag, xmlOpeningTag } from "./patterns"

const voidTags = /^(area|base|w?br|col|embed|hr|img|input|link|meta|source|track)$/

const isOpening = (value: string) => !voidTags.test(value.match(xmlOpeningTag)?.[1] || "br")

languageMap.markup =
	languageMap.html =
	languageMap.markdown =
	languageMap.md =
		{
			comments: {
				block: ["<!--", "-->"],
			},
			autoIndent: [
				([start], value) =>
					isOpening((value = value.substring(start - 999, start))) ||
					/[([{][^\n)\]}]*$/.test(value),
				([start, end], value) =>
					isBracketPair.test(value[start - 1] + value[end]) ||
					(isOpening(value.substring(start - 999, start)) && xmlClosingTag.test(value.slice(end))),
			],
			autoCloseTags([start, end], value) {
				const tagName =
					start == end ? (value.substring(start - 999, start) + ">").match(xmlOpeningTag)?.[1] : ""
				if (tagName && !voidTags.test(tagName)) return `</${tagName}>`
			},
		}
