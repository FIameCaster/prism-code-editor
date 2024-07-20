export type CompletionFilter = (query: string, option: string) => [number, number[]] | undefined

const fuzzyFilter: CompletionFilter = (query: string, option: string) => {
	const optionLen = option.length
	const queryLen = query.length

	if (queryLen > optionLen) return
	if (queryLen < 2 || queryLen == optionLen) return strictFilter(query, option)

	const queryLc = query.toLowerCase()
	const optionLc = option.toLowerCase()
	const matched: number[] = []

	let score = 0
	let i = 0
	let prevPos = 0
	let j = 0
	for (; i < queryLen; i++) {
		const char = queryLc[i]
		const pos = optionLc.indexOf(char, prevPos)
		const hasSkipped = pos > prevPos

		if (pos < 0) return
		if (hasSkipped) score -= 800
		if (hasSkipped || !j) {
			matched[j++] = pos
			matched[j++] = pos + 1
		} else {
			matched[j - 1] = pos + 1
		}

		// Add a penalty if the query and option had different case
		if ((<any>(char != query[i])) ^ (<any>(optionLc[pos] != option[pos]))) score -= 100
		prevPos = pos + 1
	}

	return [score - optionLen - (queryLen < optionLen ? 100 : 0), matched]
}

const strictFilter: CompletionFilter = (query: string, option: string) => {
	const optionLen = option.length
	const queryLen = query.length

	if (queryLen > optionLen) return

	const start = option.slice(0, queryLen)
	const score = start == query ? 0 : query.toLowerCase() == start.toLowerCase() ? -200 : null
	if (score == null) return

	return [query ? score - optionLen - (queryLen < optionLen ? 100 : 0) : 0, [0, queryLen]]
}

export { fuzzyFilter, strictFilter }
