import { languageMap } from "../core"
import { clikeIndent, isBracketPair } from "./patterns"

languageMap.clike =
	languageMap.js =
	languageMap.javascript =
	languageMap.ts =
	languageMap.typescript =
	languageMap.java =
	languageMap.cs =
	languageMap.csharp =
	languageMap.c =
	languageMap.cpp =
		{
			comments: {
				line: "//",
				block: ["/*", "*/"],
			},
			autoIndent: [
				([start], value) => clikeIndent.test(value.slice(0, start)),
				([start, end], value) => isBracketPair.test(value[start - 1] + value[end]),
			],
		}
