import { languageMap } from "../core"
import { bracketIndenting } from "./shared"

languageMap.lua = bracketIndenting({ line: "--", block: ["--[[", "]]"] })
