import path from 'path';
import fs from 'fs';
import http from 'http';
import { app, BrowserWindow, ipcMain, IpcMainEvent, nativeImage, dialog } from 'electron';
import express from 'express';
import fetch, { Headers, Request, Response } from 'node-fetch';
import btoa from 'btoa';
import { dataDir, redditUrl, authRedirect, appToken } from '../consts';
import * as api from './api/index';
import {_, HTTPDump} from '../utils'; _;
import { RedditMe } from './api/account';
import { RedditFeed } from './api/reddit-types';
import { RedditVoteType } from './api/link';
import { GetCommentsArguments } from './api/link/comments';

let window: BrowserWindow|null = null;
let webserver: http.Server|null = null;

const globalState:
{
	hasRSharpDir: boolean;
	hadTroubleLaunching: boolean;
	hadTroubleLaunchingReason: string;
	doLogin: boolean;
	storedError: string;
	oauthOtc: string;
	oauthAccessToken: string;
	oauthRefreshToken: string;
	oauthExpiresAt?: Date;
	userName?: string;
	userId?: string;
	userPrefs:
	{
		lastDirectory?: string;
	};
	sessionTracker: string;
} = 
{
	hasRSharpDir: false,
	hadTroubleLaunching: false,
	hadTroubleLaunchingReason: '',
	doLogin: false,
	storedError: 'N-no errror?',
	oauthOtc: '',
	oauthAccessToken: '',
	oauthRefreshToken: '',
	userId: '',
	userPrefs: {},
	sessionTracker: '',
};

interface RedditOauthTokenResponse
{
	access_token: string,
	token_type: 'bearer',
	expires_in: number,
	scope: string,
	refresh_token: string,
}

const prep = async (): Promise<void> =>
{
	await new Promise<void>((resolve): void =>
	{
		fs.promises.access(dataDir)
			.then((): void =>
			{
				globalState.hasRSharpDir = true;
				resolve();
			})
			.catch((): void => resolve());
	});
	if (!globalState.hasRSharpDir)
	{
		await fs.promises.mkdir(dataDir)
			.catch((): void =>
			{
				globalState.hadTroubleLaunching = true;
				globalState.hadTroubleLaunchingReason = `Failed to create directory at ${dataDir}!`;
			});
	}
	await new Promise<void>((resolve): void =>
	{
		fs.promises.access(path.join(dataDir, 'last-account.dat'))
			.then(async (): Promise<void> =>
			{
				const err: void|Error = await getTokenFromDisk();
				if (err != null) console.log(err);
				resolve();
			})
			.catch((): void =>
			{
				globalState.doLogin = true;
				resolve();
			});
	})
};

const createWindow = (): void =>
{
	window = new BrowserWindow
	({
		width: 800,
		height: 600,
		autoHideMenuBar: true,
		webPreferences:
		{
			nodeIntegration: true,
			nodeIntegrationInSubFrames: true,
		},
	});

	if (globalState.hadTroubleLaunching)
		window.loadFile(path.join(__dirname, '../renderer/error.html'))
	else
		if (globalState.doLogin)
			login();
		else
			window.loadFile(path.join(__dirname, '../renderer/index.html'));
};

const login = async (): Promise<void> =>
{
	await new Promise((resolve: (v: string) => void, reject): void =>
	{
		let state: string = '';
		while (state.length < 16) state += String.fromCharCode(Math.random()*26+65);

		ipcMain.on('reddit:get-otc:reddit-error', (e: IpcMainEvent, apiError: string): void =>
			{ globalState.storedError = `Reddit:GetOtc:RedditError:${apiError}`; reject(); });

		ipcMain.on('reddit:get-otc:get-state', (e: IpcMainEvent): void =>
			e.reply('reply:reddit:get-otc:get-state', state));

		ipcMain.on('reddit:get-otc:state-error', (e: IpcMainEvent, gotState: string, expectedState: string): void =>
			{ globalState.storedError = `Reddit:GetOtc:StateMatchError:${gotState},${expectedState}`; reject(); });
		
		ipcMain.on('reddit:get-otc:url-error', (e: IpcMainEvent, url: string): void =>
			{ globalState.storedError = `Reddit:GetOtc:UrlMatchError:${url}`; reject(); });
		
		// For when we finally actually get the OTC to get the token.
		ipcMain.on('reddit:get-otc:otc', (e: IpcMainEvent, otc: string): void =>
			{ globalState.storedError = 'Success!'; resolve(otc); });

		const expressApp: express.Express = express();
		expressApp.use('/reddit/oauth', express.static(path.join(__dirname, 'oauth-helper')));
		try { webserver = expressApp.listen(9001); }
		catch(err) { globalState.storedError = `Reddit:GetOtc:WebserverError:Webserver already listening on port 9001.`; reject(); }

		window?.loadURL(
			`${redditUrl}/api/v1/authorize${''
				}?client_id=${appToken}${''
				}&response_type=code${''
				}&state=${state}${''
				}&redirect_uri=${authRedirect}${''
				}&duration=permanent${''
				}&scope=${'identity,edit,flair,history,modconfig,modflair,modlog,modposts,modwiki,mysubreddits,privatemessages,read,report,save,submit,subscribe,vote,wikiedit,wikiread'}`)
	})
	.then(async (v: string): Promise<void> =>
	{
		await getToken(v);
		window?.loadFile(path.join(__dirname, '../renderer/index.html'));
	})
	.catch((): void =>
	{
		window?.loadFile(path.join(__dirname, '../renderer/error.html'));
	})
	.finally((): void =>
	{
		// Clean up ipcMain listeners.
		ipcMain.removeHandler('reddit:get-otc:reddit-error');
		ipcMain.removeHandler('reddit:get-otc:get-state');
		ipcMain.removeHandler('reddit:get-otc:state-error');
		ipcMain.removeHandler('reddit:get-otc:url-error');
		ipcMain.removeHandler('reddit:get-otc:otc');
		
		// Kill the server.
		webserver?.close();
		webserver = null;
	});
};

/**
 * ### getToken
 * 
 * Gets a token by using a provided one-time code.
 * 
 * @param otc The one-time code provided by Reddit.
 */
const getToken = async (otc: string): Promise<void> =>
{
	const res: RedditOauthTokenResponse = await
	(
		await fetch
		(
			`${redditUrl}/api/v1/access_token`, 
			{
				method: 'POST',
				body: `grant_type=authorization_code&code=${otc}&redirect_uri=${authRedirect}`,
				headers: new Headers
				({
					'Authorization': `Basic ${btoa(`${appToken}:`)}`,
					'content-type': 'application/x-www-form-urlencoded',
					'User-Agent': `R# for Reddit -- Not logged in`,
					'x-internship': `I'm still in highschool, but an internship at Reddit would be awesome. See https://github.com/K4rakara.`
				}),
			}
		)
	).json();

	// Save to `globalState`.
	globalState.oauthAccessToken = res.access_token;
	globalState.oauthRefreshToken = res.refresh_token;
	globalState.oauthExpiresAt = (new Date()).addSeconds(res.expires_in);

	// Get "me" -- AKA the user and store stuff.
	const me: RedditMe = await api.account.getMe(globalState.oauthAccessToken);
	globalState.userName = me.subreddit.display_name_prefixed;
	globalState.userId = me.id;
	
	// Save to disk.
	await fs.promises.access(path.join(dataDir, `${globalState.userId}/`))
		.catch(async (): Promise<void> =>
		{
			await fs.promises.mkdir(path.join(dataDir, `${globalState.userId}/`));
		});
	await fs.promises.writeFile
	(
		path.join(dataDir, `./${globalState.userId}/oauth.lock`),
		`${
			globalState.oauthAccessToken
		}\n${
			globalState.oauthRefreshToken
		}\n${
			globalState.oauthExpiresAt?.inSeconds()
		}\n${
			globalState.userName
		}`
	);
	await fs.promises.writeFile
	(
		path.join(dataDir, `last-account.dat`),
		globalState.userId
	);

	// Set a timeout for when the token needs to be refreshed.
	setTimeout((): void => { refreshToken(); }, res.expires_in * 1000 - (1000 * 60));
};

/**
 * ### getTokenFromDisk
 * 
 * Retrieves the Oauth access & refresh tokens, as well as when they expire from disk.
 * 
 * Automatically refreshes the token if required, and sets up a timeout for when to refresh it next.
 * 
 * ##### Errors
 * - Errors if the file "`last-account.dat`" does not exist.
 * - Errors if the file "`oauth-<NAME>.lock`" does not exist, where `<NAME>` is the content of `last-account.dat`.
 */
const getTokenFromDisk = async (): Promise<void|Error> =>
{
	let toReturn: Error|null = null;
	await fs.promises.access(path.join(dataDir, 'last-account.dat'))
		.then(async (): Promise<void> =>
		{
			const lastAccount: string = await fs.promises.readFile(path.join(dataDir, 'last-account.dat'), 'utf8');
			await fs.promises.access(path.join(dataDir, `${lastAccount}/oauth.lock`))
				.then(async (): Promise<void> =>
				{
					const split: string[] = 
					(
						await fs.promises.readFile
						(
							path.join(dataDir, `${lastAccount}/oauth.lock`),
							'utf8'
						)
					).split('\n');

					// Save to `globalState`.
					globalState.oauthAccessToken = split[0];
					globalState.oauthRefreshToken = split[1];
					globalState.oauthExpiresAt = new Date(parseInt(split[2]) * 1000);
					globalState.userName = split[3];
					globalState.userId = lastAccount;
					await getPrefsFromDisk();

					// Automatically refresh token if required.
					if (new Date().isPast(globalState.oauthExpiresAt))
						await refreshToken();
					
					// Set a timeout on when to refresh the token.
					setTimeout((): void =>
					{
						refreshToken();
					},
						(
							globalState.oauthExpiresAt?.inSeconds()
							- new Date().inSeconds()
						) * 1000
						- (1000 * 60)
					)
				})
				.catch((): void =>
				{
					toReturn = new Error(`The file "${lastAccount}/oauth.lock" does not exist -- But is required by "last-account.dat".`);
				})
		})
		.catch((): void =>
		{
			toReturn = new Error("The file \"last-account.dat\" does not exist.");
		});

	if (toReturn != null) return toReturn;
};

/**
 * ### refreshToken
 * 
 * Refreshes the token stored in `globalState`.
 * 
 * The new token is automatically saved to an oauth.lock file.
 */
const refreshToken = async (): Promise<void> =>
{
	const res: RedditOauthTokenResponse = await
	(
		await fetch
		(
			`${redditUrl}/api/v1/access_token`,
			{
				method: 'POST',
				body: `grant_type=refresh_token&refresh_token=${globalState.oauthRefreshToken}`,
				headers: new Headers
				({
					'Authorization': `Basic ${btoa(`${appToken}:`)}`,
					'content-type': 'application/x-www-form-urlencoded',
					'User-Agent': (globalState.userName != null)
						? `R# for Reddit -- Logged in as ${globalState.userName}`
						: `R# for Reddit -- Not logged in`,
					'x-internship': `I'm still in highschool, but an internship at Reddit would be awesome. See https://github.com/K4rakara.`
				})
			}
		)
	).json();

	// Save to `globalState`.
	globalState.oauthAccessToken = res.access_token;
	globalState.oauthExpiresAt = (new Date()).addSeconds(res.expires_in);

	// Save to disk.
	await fs.promises.writeFile
	(
		path.join(dataDir, `${globalState.userId}/oauth.lock`),
		`${
			globalState.oauthAccessToken
		}\n${
			globalState.oauthRefreshToken
		}\n${
			globalState.oauthExpiresAt?.inSeconds()
		}\n${
			globalState.userName
		}`
	);

	// Set a listener to refresh the token when needed.
	setTimeout((): void => { refreshToken(); }, res.expires_in * 1000 - (1000 * 60));
};

/**
 * TODO: Docs
 */
const getPrefsFromDisk = async (): Promise<void> =>
{
	const prefsFile: string = path.join(dataDir, `${globalState.userId}/config.rsharp.json`);
	await fs.promises.access(prefsFile)
		.then(async (): Promise<void> =>
		{
			globalState.userPrefs = JSON.parse(await fs.promises.readFile(prefsFile, 'utf8'));
		})
		.catch(async (): Promise<void> =>
		{
			globalState.userPrefs = {};
			await fs.promises.writeFile(prefsFile, '{}');
		});
};

/**
 * TODO: DOCs
 */
const savePrefsToDisk = async (): Promise<void> =>
{
	const prefsFile: string = path.join(dataDir, `${globalState.userId}/config.rsharp.json`);
	await fs.promises.writeFile(prefsFile, JSON.stringify(globalState.userPrefs), 'utf8');
};

app.whenReady().then(async (): Promise<void> =>
{
	await prep();
	createWindow();
	app.on('activate', (): void =>
	{
		if (BrowserWindow.getAllWindows().length === 0)
			createWindow();
	});
});

app.on('window-all-closed', (): void =>
{
	if (process.platform !== 'darwin') app.quit();
});

ipcMain.on('get-stored-error', (e: IpcMainEvent): void =>
{
	e.reply('got-stored-error', globalState.storedError);
});

ipcMain.on('get-token', (e: IpcMainEvent): void =>
{
	e.reply('reply:get-token', globalState.oauthAccessToken);	
});

ipcMain.on('reddit:account:get-me', async (e: IpcMainEvent): Promise<void> =>
{
	const me: RedditMe = await api.account.getMe(globalState.oauthAccessToken, globalState.userName);
	e.reply('reply:reddit:account:get-me', me);
});

/**
 * ### `reddit:listings:best`
 * 
 */
ipcMain.on('reddit:listings:best', async (e: IpcMainEvent, after?: string|null): Promise<void> =>
{
	const feed: RedditFeed = await api.listings.listBest(after ?? '', globalState.oauthAccessToken, globalState.userName);
	e.reply('reply:reddit:listings:best', feed);
});

/**
 * @summary Votes for a link by `fullname`.
 * @description Votes for a link by `fullname`. Returns a boolean which is true unless errors occur.
 * @param {string} link -- The `fullname` of the link to vote for.
 * @param {RedditVoteType} dir -- The "direction" to vote in. 
 * @returns {boolean}
 */
ipcMain.on('reddit:link:vote', async (e: IpcMainEvent, link: string, dir: RedditVoteType): Promise<void> =>
{
	const ok: boolean = await api.link.vote(link, dir, globalState.oauthAccessToken, globalState.userName);
	e.reply('reply:reddit:link:vote', ok);
});

/**
 * @summary Saves a link by `fullname`.
 * @description Saves a link by `fullname`. Returns a boolean which is true unless errors occur.
 * @param {string} link -- The `fullname` of the link to save.
 * @param {boolean} [save=true] -- Wether to save or un-save the link. save by default.
 * @returns {boolean}
 */
ipcMain.on('reddit:link:save', async (e: IpcMainEvent, link: string, save?: boolean): Promise<void> =>
{
	if (!(save != null)) save = true;
	const ok: boolean = await api.link.save(link, save, globalState.oauthAccessToken, globalState.userName);
	e.reply('reply:reddit:link:save', ok);
});

ipcMain.on('reddit:link:comments', async (e: IpcMainEvent, link: string, subreddit?: string, arg?: GetCommentsArguments): Promise<void> =>
{
	e.reply('reply:reddit:link:comments', await api.link.getComments(link, globalState.oauthAccessToken, globalState.userName!, arg||{}));
});

/**
 * @name ipcMain.r-sharp.io.save-image-from-url
 * @summary Accepts a URL and proceeds to save the image content from said URL.
 * @param {string} url - The URL to the image.
 * @returns {boolean} - Wether or not the operation was successful.
 */
ipcMain.on('r-sharp:io:save-image-from-url', async (e: IpcMainEvent, url: string): Promise<void> =>
{
	try
	{
		const arr: ArrayBuffer = await (await fetch(url)).arrayBuffer();
		const result = await dialog.showSaveDialog
		(
			window!,
			{
				title: `Saving ${url}`,
				defaultPath: ((): string =>
				{
					if (globalState.userPrefs.lastDirectory != null)
						return globalState.userPrefs.lastDirectory!;
					else
						if (process.platform === 'linux')
							return path.join('/home/', process.env.USER!)
						else if (process.platform === 'win32')
							return 'C:/';
						else
							return '';
				})()
			}
		);
		if (!result.canceled)
		{
			await fs.promises.writeFile(result.filePath!, Buffer.from(arr));
			globalState.userPrefs.lastDirectory = path.parse(result.filePath!).dir;
			await savePrefsToDisk();
		}
		e.reply('reply:r-sharp:io:save-image-from-url', !result.canceled);
	}
	catch(err) { e.reply('reply:r-sharp:io:save-image-from-url', false); }
});