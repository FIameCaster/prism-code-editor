const themes = import.meta.glob("./*.css", { query: "?inline" })

/**
 * Function that allows overriding the default themes or registering new themes to be
 * used by the setups or web components.
 * @param name Name of the theme.
 * @param loader Function returning a promise that resolves with the CSS for the theme.
 */
const registerTheme = (name: string, loader: () => Promise<{ default: string }>) => {
	themes[`./${name}.css`] = loader
}

/**
 * Asynchronously loads the theme with the specified name.
 * The promise returned resolves with the CSS string for the theme.
 */
const loadTheme = async (name: string) =>
	(<undefined | { default: string }>await themes[`./${name}.css`]?.())?.default

export { loadTheme, registerTheme }
