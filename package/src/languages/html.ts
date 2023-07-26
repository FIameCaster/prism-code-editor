import { languages } from "../index.js"

const openingTag =
	/<(?!\d)([^\s>\/=$<%]+)(?:\s(?:\s*[^\s>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))|(?=[\s/>])))+)?\s*>[ \t]*$/
const voidTags = /^(area|base|br|col|embed|hr|img|input|link|meta|source|track|wbr)$/
const closingTag = /^<\/(?!\d)[^\s>\/=$<%]+\s*>/

const isOpening = (value: string) => !voidTags.test(value.match(openingTag)?.[1] || "br")

languages.markup =
	languages.html =
	languages.mathml =
	languages.svg =
	languages.markdown =
	languages.md =
		{
			comments: {
				block: ["<!--", "-->"],
			},
			autoIndent: [
				([start], value) => isOpening(value.slice(0, start)),
				([start, end], value) =>
					isOpening(value.slice(0, start)) && closingTag.test(value.slice(end)),
			],
			autoCloseTags([start, end], value) {
				const tagName = start == end ? (value.slice(0, start) + ">").match(openingTag)?.[1] : ""
				return tagName && !voidTags.test(tagName) ? `</${tagName}>` : ""
			},
		}
