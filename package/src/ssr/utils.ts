import { escapeHtml } from "../prism/core"

const escapeQuotes = (html: string) => {
	return escapeHtml(html, /"/g, "&quot;")
}

export { escapeQuotes }
