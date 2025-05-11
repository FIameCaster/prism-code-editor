# Docs

This is the documentation website for Prism code editor built with [starlight](https://starlight.astro.build).

## Development

To run the website locally, you must install dependencies:

	pnpm install

Build the package:

	cd ../package
	pnpm install
	pnpm build

Build the rehype plugin:

	cd ../rehype-plugin
	pnpm install
	pnpm build

Now you're ready to run the dev server:

	cd ../docs
	pnpm dev

## Build

To build the documentation site for production, run the build command:

	pnpm build
