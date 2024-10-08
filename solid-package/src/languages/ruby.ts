import { languageMap } from "../core"
import { bracketIndenting } from "./shared"

languageMap.crystal = languageMap.rb = languageMap.ruby = bracketIndenting({ line: "#", block: ["=begin", "=end"] })
