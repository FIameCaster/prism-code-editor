import { languages } from "../core"
import { xmlClosingTag, xmlOpeningTag } from "./patterns"

const voidTags = /^(area|base|w?br|col|embed|hr|img|input|link|meta|source|track)$/

const isOpening = (value: string) => !voidTags.test(value.match(xmlOpeningTag)?.[1] || "br")

languages.markup =
	languages.html =
	languages.markdown =
	languages.md =
		{
			comments: {
				block: ["<!--", "-->"],
			},
			autoIndent: [
				([start], value) => isOpening(value.slice(0, start)),
				([start, end], value) =>
					isOpening(value.slice(0, start).slice(-999)) && xmlClosingTag.test(value.slice(end)),
			],
			autoCloseTags([start, end], value) {
				const tagName =
					start == end ? (value.slice(0, start).slice(-999) + ">").match(xmlOpeningTag)?.[1] : ""
				if (tagName && !voidTags.test(tagName)) return `</${tagName}>`
			},
		}