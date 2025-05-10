import { useEffect, useState } from "react"

const themes = import.meta.glob("./*.css", { query: "?inline" })

export type IncludedTheme =
	| "atom-one-dark"
	| "dracula"
	| "github-dark"
	| "github-dark-dimmed"
	| "github-light"
	| "night-owl"
	| "night-owl-light"
	| "prism"
	| "prism-okaidia"
	| "prism-solarized-light"
	| "prism-tomorrow"
	| "prism-twilight"
	| "vs-code-dark"
	| "vs-code-light"

export type EditorTheme = IncludedTheme | (string & {})

/**
 * Function that allows overriding the default themes or registering new themes to be
 * loaded by {@link loadTheme} or {@link useEditorTheme}.
 * @param name Name of the theme.
 * @param loader Function returning a promise that resolves with the CSS for the theme.
 */
const registerTheme = (name: string, loader: () => Promise<{ default: string }>) => {
	themes[`./${name}.css`] = loader
}

/**
 * Asynchronously loads the theme with the specified name.
 * The promise returned resolves with the CSS string for the theme.
 * This CSS can then be added to a `<style>` element on the page.
 * @param name Name of the theme.
 */
const loadTheme = async (name: EditorTheme) =>
	(<undefined | { default: string }>await themes[`./${name}.css`]?.())?.default

/**
 * Hook that loads the theme with the specified name and returns the CSS string.
 * If you want to load your own themes with this hook, use {@link registerTheme}
 * to register your themes.
 * @param name Name of the theme.
 * @returns CSS for the theme. If the theme hasn't loaded yet, `undefined` is returned
 */
const useEditorTheme = (name: EditorTheme) => {
	const [themeCss, setCss] = useState<string | undefined>()

	useEffect(
		(cancelled?: boolean) => {
			loadTheme(name).then(css => {
				if (!cancelled) setCss(css)
			})
			return () => {
				cancelled = true
			}
		},
		[name],
	)

	return themeCss
}

export { registerTheme, loadTheme, useEditorTheme }
