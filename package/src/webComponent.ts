/** @module web-component */

import { PrismEditor } from "./types"
import { basicEditor, fullEditor, minimalEditor, readonlyEditor, updateTheme } from "./setups"

const attributeMap = {
	language: (value: string | null) => value || "text",
	"tab-size": (value: string | null) => +value!,
	"insert-spaces": (value: string | null) => value != null,
	"line-numbers": (value: string | null) => value != null,
	readonly: (value: string | null) => value != null,
	"word-wrap": (value: string | null) => value != null,
	rtl: (value: string | null) => value != null,
	theme: (value: string | null) => value || "vs-code-dark",
} as const

const propMap = {
	language: "language",
	"tab-size": "tabSize",
	"insert-spaces": "insertSpaces",
	"line-numbers": "lineNumbers",
	readonly: "readOnly",
	"word-wrap": "wordWrap",
	rtl: "rtl",
	theme: "theme",
} as const

const attributes = Object.keys(attributeMap)

const getOptions = (el: HTMLElement) => {
	const options = <
		{
			language: string
			tabSize: number
			wordWrap: boolean
			insertSpaces: boolean
			lineNumbers: boolean
			readOnly: boolean
			theme: string
			value: string
		}
	>{}
	for (let key in attributeMap) // @ts-ignore
		options[propMap[key]] = attributeMap[key](el.getAttribute(key))

	options.value = el.textContent!
	el.textContent = ""
	return options
}

const addComponent = (name: string, createEditor: typeof basicEditor) => {
	customElements.define(
		name,
		class extends HTMLElement {
			static observedAttributes = attributes
			editor: PrismEditor

			constructor() {
				super()
				this.editor = createEditor(this, getOptions(this), () =>
					this.dispatchEvent(new CustomEvent("ready")),
				)

				for (const [attr, prop] of Object.entries(propMap))
					Object.defineProperty(this, prop, {
						enumerable: true, // @ts-ignore
						get: () => attributeMap[attr](this.getAttribute(attr)),
						set: /language|theme|tab-size/.test(attr)
							? (val: string) => this.setAttribute(attr, val)
							: (val: boolean) => this.toggleAttribute(attr, val),
					})
			}

			get value() {
				return this.editor.value
			}
			set value(value: string) {
				this.editor.setOptions({ value })
			}

			attributeChangedCallback(
				name: keyof typeof attributeMap,
				oldValue: string | null,
				newValue: string | null,
			) {
				const newVal = attributeMap[name](newValue)
				if (attributeMap[name](oldValue) != newVal) {
					if (name == "theme") updateTheme(this.editor, <string>newVal)
					else
						this.editor.setOptions({
							[propMap[name]]: newVal,
						})
				}
			}
		},
	)
}

export interface PrismEditorElement extends HTMLElement {
	readonly editor: PrismEditor
	value: string
	theme: string
	language: string
	tabSize: number
	insertSpaces: boolean
	lineNumbers: boolean
	readOnly: boolean
	wordWrap: boolean

	addEventListener(
		type: "ready",
		listener: (this: PrismEditorElement, ev: CustomEvent) => any,
		options?: boolean | AddEventListenerOptions,
	): void
	addEventListener<K extends keyof HTMLElementEventMap>(
		type: K,
		listener: (this: PrismEditorElement, ev: HTMLElementEventMap[K]) => any,
		options?: boolean | AddEventListenerOptions,
	): void
	addEventListener(
		type: string,
		listener: EventListenerOrEventListenerObject,
		options?: boolean | AddEventListenerOptions,
	): void

	removeEventListener(
		type: "ready",
		listener: (this: PrismEditorElement, ev: CustomEvent) => any,
		options?: boolean | EventListenerOptions,
	): void
	removeEventListener<K extends keyof HTMLElementEventMap>(
		type: K,
		listener: (this: PrismEditorElement, ev: HTMLElementEventMap[K]) => any,
		options?: boolean | EventListenerOptions,
	): void
	removeEventListener(
		type: string,
		listener: EventListenerOrEventListenerObject,
		options?: boolean | EventListenerOptions,
	): void
}

/**
 * Adds a custom element wrapping the {@link minimalEditor} setup.
 * @param name Name of the custom element. Must be a valid custom element name.
 */
export const addMinimalEditor = (name: string) =>
	addComponent(name, minimalEditor)
/**
 * Adds a custom element wrapping the {@link basicEditor} setup.
 * @param name Name of the custom element. Must be a valid custom element name.
 */
export const addBasicEditor = (name: string) =>
	addComponent(name, basicEditor)
/**
 * Adds a custom element wrapping the {@link fullEditor} setup.
 * @param name Name of the custom element. Must be a valid custom element name.
 */
export const addFullEditor = (name: string) =>
	addComponent(name, fullEditor)
/**
 * Adds a custom element wrapping the {@link readonlyEditor} setup.
 * @param name Name of the custom element. Must be a valid custom element name.
 */
export const addReadonlyEditor = (name: string) =>
	addComponent(name, readonlyEditor)
