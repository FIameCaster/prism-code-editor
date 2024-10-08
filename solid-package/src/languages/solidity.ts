import { languageMap } from ".."
import { bracketIndenting, clikeComment, clikeIndent } from "./shared"

languageMap.sol = languageMap.solidity = bracketIndenting(clikeComment, clikeIndent)
