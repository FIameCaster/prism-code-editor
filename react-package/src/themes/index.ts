const themes = import.meta.glob("./*.css", { query: "?inline" })

/** Asynchronously loads the theme with the specified name. */
export const loadTheme = async (name: string) =>
	(<undefined | { default: string }>await themes[`./${name}.css`]?.())?.default
