import fs from "node:fs"

const files = fs.readdirSync('./src/prism/languages')

/** @type {Record<string, string[]>} */
const depsMap = {}

Promise.all(files.map(async file => {
  const name = file.slice(0, -3)
  depsMap[name] = []
  const code = await fs.promises.readFile('./src/prism/languages/' + file, { encoding: "utf-8" })
  depsMap[name] = (code.match(/import '\.\/[^.]+\.js';/g) || []).map(str => str.slice(10, -5))
})).then(() => {
  /** @type {string} */
  const lines = []
  
  /**
   * @param {string} fileName
   * @param {Set<string>} deps
   */
  const addDeps = (fileName, deps) => {
    for (const dep of depsMap[fileName]) {
      if (!deps.has(dep)) {
        addDeps(dep, deps)
        deps.add(dep)
      }
    }
    return deps
  }
  
  for (let file in depsMap) {
		const arr = []
		for (const dep of addDeps(file, new Set())) {
			arr.push(`"${dep}"`)
		}
    lines.push(`\t"${file}": [${arr.join(', ')}]`)
  }

	fs.promises.writeFile('./src/prism/tests/dependencies.json', `{\n${lines.join(",\n")}\n}\n`)
})
