# Website

This is the website for the library with examples and a simple playground.

## Development

It is a regular vite TypeScript project, so to run it locally, install depedencies:

	pnpm install

Before you can run the website, you need to build the package:

	cd ../package
	pnpm install
	pnpm run build

Then you must link it to the website:

	cd ../website
	pnpm link ../package

And run the dev server:

	pnpm run dev

## Build

To build the demo site for production, run the build script:

	pnpm run build

To build both the demo site and the API documentation run:

	pnpm run docs
