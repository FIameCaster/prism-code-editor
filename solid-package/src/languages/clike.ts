import { languageMap } from "../core"
import { bracketIndenting, clikeComment, clikeIndent } from "./shared"

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
	languageMap.go =
	languageMap.d =
	languageMap.dart =
	languageMap.flow =
	languageMap.haxe =
		bracketIndenting(clikeComment, clikeIndent)
