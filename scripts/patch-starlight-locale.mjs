import { readFile, writeFile } from 'node:fs/promises';

const file = 'node_modules/@astrojs/starlight/utils/navigation.ts';
const source = await readFile(file, 'utf8');
const original = "\tconst localizedSlug = locale ? (slug ? locale + '/' + slug : locale) : slug;";
const replacement = [
	'\t// Keep the default locale at the site root.',
	'\tconst defaultLocale = config.defaultLocale?.locale;',
	'\tconst shouldPrefix = locale && locale !== defaultLocale;',
	"\tconst localizedSlug = shouldPrefix ? (slug ? locale + '/' + slug : locale) : slug;",
].join('\n');
const patchedMarker = '\tconst shouldPrefix = locale && locale !== defaultLocale;';

if (source.includes(patchedMarker)) process.exit(0);
if (source.split(original).length !== 2) {
	throw new Error('Unexpected Starlight navigation source; refusing to apply locale patch');
}

await writeFile(file, source.replace(original, replacement));
