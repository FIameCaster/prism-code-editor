/** @module web-component */

import { PrismEditor } from "./types.js"
import { SetupOptions, basicEditor, minimalEditor, readonlyEditor } from "./setups/index.js"
import { EditorTheme } from "./themes/index.js"

const attributeMap = {
	language: [(value: string | null) => value || "text"],
	"tab-size": [(value: string | null) => +value! || 2, "tabSize"],
	"insert-spaces": [(value: string | null) => value != null, "insertSpaces"],
	"line-numbers": [(value: string | null) => value != null, "lineNumbers"],
	readonly: [(value: string | null) => value != null, "readOnly"],
	"word-wrap": [(value: string | null) => value != null, "wordWrap"],
	rtl: [(value: string | null) => value != null],
	theme: [(value: string | null) => value || "vs-code-dark"],
} as const

const attributes = Object.keys(attributeMap)

const getOptions = (el: HTMLElement) => {
	const options = <Required<SetupOptions>>{}
	for (let key in attributeMap) // @ts-expect-error
		options[attributeMap[key][1] || key] = attributeMap[key][0](el.getAttribute(key))

	options.value = el.textContent!
	el.textContent = ""
	return options
}

const addComponent = (createEditor: typeof basicEditor, name: string) => {
	customElements.define(
		name,
		class extends HTMLElement {
			static observedAttributes = attributes
			static formAssociated = true

			editor: PrismEditor

			constructor() {
				super()
				const internals = this.attachInternals?.()
				this.editor = createEditor(this, getOptions(this), () =>
					this.dispatchEvent(new CustomEvent("ready")),
				)
				if (internals) {
					this.editor.on("update", internals.setFormValue.bind(internals))
				}

				for (const attr in attributeMap)
					Object.defineProperty(this, attributeMap[<keyof typeof attributeMap>attr][1] || attr, {
						enumerable: true,
						get: () => attributeMap[<keyof typeof attributeMap>attr][0](this.getAttribute(attr)),
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

			formResetCallback() {
				this.value = this.editor.options.value
			}

			attributeChangedCallback(
				name: keyof typeof attributeMap,
				oldValue: string | null,
				newValue: string | null,
			) {
				const [fn, propName] = attributeMap[name]
				const newVal = fn(newValue)
				if (fn(oldValue) != newVal) {
					this.editor.setOptions({
						[propName || name]: newVal,
					})
				}
			}
		},
	)
}

export interface PrismEditorElement extends HTMLElement {
	readonly editor: PrismEditor<{ theme: EditorTheme }>
	value: string
	theme: EditorTheme
	language: string
	tabSize: number
	insertSpaces: boolean
	lineNumbers: boolean
	readOnly: boolean
	wordWrap: boolean
	rtl: boolean

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
export const addMinimalEditor = (name: string) => addComponent(minimalEditor, name)
/**
 * Adds a custom element wrapping the {@link basicEditor} setup.
 * @param name Name of the custom element. Must be a valid custom element name.
 */
export const addBasicEditor = (name: string) => addComponent(basicEditor, name)
/**
 * Adds a custom element wrapping the {@link readonlyEditor} setup.
 * @param name Name of the custom element. Must be a valid custom element name.
 */
export const addReadonlyEditor = (name: string) => addComponent(readonlyEditor, name)
