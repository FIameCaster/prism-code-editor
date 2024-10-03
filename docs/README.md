# Docs

This is the documenation website for Prism code editor built with [starlight](https://starlight.astro.build).

## Development

To run the website locally, you must install dependencies:

	pnpm install

Build the package:

	cd ../package
	pnpm install
	pnpm build

And link the package to the docs:

	cd ../website
	pnpm link ../package

Now you're ready to run the dev server:

	pnpm dev

## Build

To build the demo site for production, run the build command:

	pnpm build
