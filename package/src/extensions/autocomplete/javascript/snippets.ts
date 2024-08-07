import { JSContext } from "./index.js"
import { Completion, CompletionSource } from "../types.js"

const jsSnipets: Completion[] = [
	{
		label: "log",
		insert: "console.log()\n",
		tabStops: [12, 12, 14],
		icon: "snippet",
		detail: "Log to the console",
	},
	{
		label: "warn",
		insert: "console.warn()\n",
		tabStops: [13, 13, 15],
		icon: "snippet",
		detail: "Log warning to the console",
	},
	{
		label: "error",
		insert: "console.error()\n",
		tabStops: [14, 14, 16],
		icon: "snippet",
		detail: "Log error to the console",
	},
	{
		label: "import",
		insert: 'import {  } from "module"\n',
		tabStops: [9, 9, 18, 24, 26],
		icon: "snippet",
		detail: "Import Statement",
	},
	{
		label: "function",
		insert: "function name(params) {\n\t\n}",
		tabStops: [9, 13, 14, 20, 25],
		icon: "snippet",
		detail: "Function Statement",
	},
	{
		label: "class",
		insert: "class name {\n\tconstructor(params) {\n\t\t\n\t}\n}",
		tabStops: [6, 10, 26, 32, 38],
		icon: "snippet",
		detail: "Class Definition",
	},
	{
		label: "throw",
		insert: 'throw new Error("")',
		tabStops: [17],
		icon: "snippet",
		detail: "Throw Exception",
	},
	{
		label: "trycatch",
		insert: "try {\n\t\n} catch (error) {\n\t\n}",
		tabStops: [7, 7, 17, 22, 27],
		icon: "snippet",
		detail: "Try-Catch Statement",
	},
	{
		label: "for",
		insert: "for (let index = 0; index < array.length; index++) {\n\t\n}",
		tabStops: [9, 14, 20, 25, 28, 33, 42, 47, 54],
		icon: "snippet",
		detail: "For Loop",
	},
	{
		label: "forof",
		insert: "for (const item of iterable) {\n\t\n}",
		tabStops: [11, 15, 19, 27, 32],
		icon: "snippet",
		detail: "For-Of Loop",
	},
	{
		label: "forin",
		insert: "for (const key in object) {\n\t\n}",
		tabStops: [11, 14, 18, 24, 29],
		icon: "snippet",
		detail: "For-In Loop",
	},
	{
		label: "forawaitof",
		insert: "for await (const item of iterable) {\n\t\n}",
		tabStops: [17, 21, 25, 33, 38],
		icon: "snippet",
		detail: "For-Await-Of Loop",
	},
	{
		label: "if",
		insert: "if () {\n\t\n}",
		tabStops: [4, 4, 9],
		icon: "snippet",
		detail: "If Statement",
	},
	{
		label: "ifelse",
		insert: "if () {\n\t\n} else {\n\t\n}",
		tabStops: [4, 4, 9, 9, 20],
		icon: "snippet",
		detail: "If-Else Statement",
	},
	{
		label: "while",
		insert: "while () {\n\t\n}",
		tabStops: [7, 7, 12],
		icon: "snippet",
		detail: "While Statement",
	},
	{
		label: "dowhile",
		insert: "do {\n\t\n} while ()",
		tabStops: [6, 6, 16],
		icon: "snippet",
		detail: "Do-While Statement",
	},
	{
		label: "switch",
		insert: "switch () {\n\t\n}",
		tabStops: [8, 8, 13],
		icon: "snippet",
		detail: "Switch Statement",
	},
]

const completeSnippets = (snippets: Completion[]): CompletionSource<JSContext> => {
	return ({ path, explicit, pos }) => {
		if (path?.length == 1 && (path[0] || explicit)) {
			return {
				from: pos - path[0].length,
				options: snippets,
			}
		}
	}
}

export { jsSnipets, completeSnippets }
