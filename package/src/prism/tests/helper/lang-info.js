import fs from "fs/promises"

/** @type {Record<string, string[]>} */
const dependencyGraph = JSON.parse(await fs.readFile(new URL("../dependencies.json", import.meta.url)))
/** @type {Record<string, string[]>} */
const optionals = JSON.parse(await fs.readFile(new URL("../optional.json", import.meta.url)))

export { dependencyGraph, optionals }
