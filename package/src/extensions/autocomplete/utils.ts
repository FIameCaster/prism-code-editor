import { matchTemplate } from "../search/search.js"
import { Completion } from "./types.js"

const optionsFromKeys = (obj: object, icon?: string): Completion[] =>
	Object.keys(obj).map(tag => ({ label: tag, icon }))

const updateNode = (node: Text, text: string) => {
	if (node.data != text) node.data = text
}

const updateMatched = (container: HTMLElement, matched: number[], text: string) => {
	let nodes = container.childNodes
	let nodeCount = nodes.length - 1
	let pos = 0
	let i = 0
	let l = matched.length

	for (; i < l; ) {
		if (i >= nodeCount) {
			nodes[i].before("", matchTemplate())
		}
		updateNode(nodes[i] as Text, text.slice(pos, (pos = matched[i++])))
		updateNode(nodes[i].firstChild as Text, text.slice(pos, (pos = matched[i++])))
	}
	for (; nodeCount > i; ) {
		nodes[--nodeCount].remove()
	}
	updateNode(nodes[l] as Text, text.slice(pos))
}

export { optionsFromKeys, updateMatched, updateNode }
