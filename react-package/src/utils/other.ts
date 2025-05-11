const getStyleValue = (el: HTMLElement, prop: keyof CSSStyleDeclaration) =>
	parseFloat(getComputedStyle(el)[prop] as string)

export { getStyleValue }
