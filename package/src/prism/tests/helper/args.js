import yargs from 'yargs/yargs';

const args = yargs(process.argv.slice(2)).argv;

/** @type {string | string[]} */
export const language = args.language;
export const update = !!args.update;
