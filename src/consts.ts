import fs from 'fs';
import path from 'path';

export const redditUrl: string = 'https://www.reddit.com';
// TODO: Make this better.
export const dataDir: string = (process.platform === 'win32')
	? ''
	: (process.platform === 'linux')
		? `/home/jack/.config/r-sharp/`
		: '';
export const authRedirect: string = 'http://localhost:9001/reddit/oauth';
export const appToken: string = fs.readFileSync(path.join(__dirname, 'app-token.key'), 'utf8');