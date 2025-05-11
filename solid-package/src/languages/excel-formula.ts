import { languageMap } from ".."
import { bracketIndenting } from "./shared"

languageMap["xlsx"] =
	languageMap["xls"] =
	languageMap["excel-formula"] =
		bracketIndenting({
			block: ['N("', '")'],
		})
