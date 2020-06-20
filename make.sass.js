#!/usr/bin/node

const fs = require('fs');
const path = require('path');
const sass = require('sass');
const glob = require('glob');

// Fix MDC shit.
glob.sync(path.join(__dirname, 'node_modules/@material/**/*.scss')).forEach((match) =>
{
	try { fs.accessSync(path.join(path.parse(match).dir, '.fixed')); }
	catch {
		let content = fs.readFileSync(match, 'utf8');
		content = content.replace(/\@use \".+?(?:functions|variables).*?\" as .+?;/gm, (substring) =>
		{
			return substring.replace(/\".+?(?:functions|variables)\"/gm, (substring) =>
			{
				substring = substring.substring(1, substring.length - 1);
				substring = substring.replace(path.parse(substring).base, `_${path.parse(substring).base}.scss`);
				return `"${substring}"`;
			})
		});
		fs.writeFileSync(match, content);
	}
})

const includePaths = glob.sync(path.join(__dirname, 'node_modules'));

glob.sync(path.join(__dirname, 'src/renderer/**/*.scss')).forEach((match) =>
{
	console.log(`Compiling "${path.parse(match).base}"...`);
	const result = sass.renderSync({
		file: match,
		includePaths,
	});
	console.log(`Saving to "${match.replace('src', 'bin').replace('scss', 'css')}...`);
	fs.writeFileSync(match.replace('src', 'bin').replace('scss', 'css'), result.css);
});
