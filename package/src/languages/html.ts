import { languageMap } from "../core"
import { autoCloseTags, isBracketPair, openBracket, xmlClosingTag, xmlOpeningTag } from "./patterns"

const voidTags = /^(?:area|base|w?br|col|embed|hr|img|input|link|meta|source|track)$/

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
				([start], value) => isOpening((value = value.slice(0, start))) || openBracket.test(value),
				([start, end], value) =>
					isBracketPair.test(value[start - 1] + value[end]) ||
					(isOpening(value.slice(0, start)) && xmlClosingTag.test(value.slice(end))),
			],
			autoCloseTags([start, end], value) {
				return autoCloseTags(this, start, end, value, xmlOpeningTag, voidTags)
			},
		}
