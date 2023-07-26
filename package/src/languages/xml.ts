import { languages } from "../index.js"

const openingTag =
	/<(?!\d)([^\s>\/=$<%]+)(?:\s(?:\s*[^\s>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))|(?=[\s/>])))+)?\s*>[ \t]*$/
const closingTag = /^<\/(?!\d)[^\s>\/=$<%]+\s*>/

// Same as HTML, but without void tags
languages.xml =
	languages.ssml =
	languages.atom =
	languages.rss =
		{
			comments: {
				block: ["<!--", "-->"],
			},
			autoIndent: [
				([start], value) => openingTag.test(value.slice(0, start)),
				([start, end], value) =>
					openingTag.test(value.slice(0, start)) && closingTag.test(value.slice(end)),
			],
			autoCloseTags([start, end], value) {
				const tagName = start == end ? (value.slice(0, start) + ">").match(openingTag)?.[1] : ""
				return tagName ? `</${tagName}>` : ""
			},
		}
