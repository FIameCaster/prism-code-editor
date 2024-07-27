import { Completion } from "./types.js"

const optionsFromKeys = (obj: object): Completion[] => Object.keys(obj).map(tag => ({ label: tag }))

export { optionsFromKeys }
