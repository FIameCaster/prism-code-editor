import { Completion } from "./types"

const optionsFromKeys = (obj: object): Completion[] => Object.keys(obj).map(tag => ({ label: tag }))

export { optionsFromKeys }
