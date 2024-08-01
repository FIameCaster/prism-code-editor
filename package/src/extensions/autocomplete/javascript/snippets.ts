import { JSContext } from "./index.js"
import { Completion, CompletionSource } from "../types.js"

const jsSnipets: Completion[] = [
	{
		label: "log",
		insert: "console.log()",
		tabStops: [12],
		icon: "snippet",
		detail: "Log to the console",
	},
	{
		label: "warn",
		insert: "console.warn()",
		tabStops: [13],
		icon: "snippet",
		detail: "Log warning to the console",
	},
	{
		label: "error",
		insert: "console.error()",
		tabStops: [14],
		icon: "snippet",
		detail: "Log error to the console",
	},
	{
		label: "import",
		insert: 'import {  } from ""',
		tabStops: [9],
		icon: "snippet",
		detail: "Import Statement",
	},
	{
		label: "function",
		insert: "function name() {\n\t\n}",
		tabStops: [9, 13],
		icon: "snippet",
		detail: "Function Statement",
	},
	{
		label: "class",
		insert: "class name {\n\tconstructor() {\n\t\t\n\t}\n}",
		tabStops: [6, 10],
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
		tabStops: [7],
		icon: "snippet",
		detail: "Try-Catch Statement",
	},
	{
		label: "for",
		insert: "for (let index = 0; index < array.length; index++) {\n\t\n}",
		tabStops: [54],
		icon: "snippet",
		detail: "For Loop",
	},
	{
		label: "forof",
		insert: "for (const item of iterable) {\n\t\n}",
		tabStops: [32],
		icon: "snippet",
		detail: "For-Of Loop",
	},
	{
		label: "forin",
		insert: "for (const key in object) {\n\t\n}",
		tabStops: [29],
		icon: "snippet",
		detail: "For-In Loop",
	},
	{
		label: "forawaitof",
		insert: "for await (const item of iterable) {\n\t\n}",
		tabStops: [38],
		icon: "snippet",
		detail: "For-Await-Of Loop",
	},
	{
		label: "if",
		insert: "if () {\n\t\n}",
		tabStops: [4],
		icon: "snippet",
		detail: "If Statement",
	},
	{
		label: "ifelse",
		insert: "if () {\n\t\n} else {\n\t\n}",
		tabStops: [4],
		icon: "snippet",
		detail: "If-Else Statement",
	},
	{
		label: "while",
		insert: "while () {\n\t\n}",
		tabStops: [7],
		icon: "snippet",
		detail: "While Statement",
	},
	{
		label: "dowhile",
		insert: "do {\n\t\n} while ()",
		tabStops: [6],
		icon: "snippet",
		detail: "Do-While Statement",
	},
	{
		label: "switch",
		insert: "switch () {\n\t\n}",
		tabStops: [8],
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
