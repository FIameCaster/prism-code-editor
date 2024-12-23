import { languageMap } from ".."
import { bracketIndenting } from "./shared"

languageMap["emacs-lisp"] =
	languageMap.emacs =
	languageMap.elisp =
	languageMap.lisp =
		bracketIndenting({ line: ";" })
