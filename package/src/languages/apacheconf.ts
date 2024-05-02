import { languageMap } from ".."
import { getLineBefore } from "../utils"

languageMap.apacheconf = {
	comments: {
		line: "#",
	},
	autoIndent: [
		([start], value) => /<\w+\b.*>[ \t]*$/.test(getLineBefore(value, start)),
		([start, end], value) =>
			/<\w+\b.*>$/.test(getLineBefore(value, start)) && /^<\/\w+\b.*>/.test(value.slice(end)),
	],
	autoCloseTags([start], value) {
		let match = /<(\w+)\b.*>/.exec(getLineBefore(value, start) + ">")
		return match! && `</${match[1]}>`
	},
}
