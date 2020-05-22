import path from 'path';
import fs from 'fs';
import http from 'http';
import { app, BrowserWindow, ipcMain, IpcMainEvent } from 'electron';
import express from 'express';
import fetch, { Headers } from 'node-fetch';
import btoa from 'btoa';
import { dataDir, redditUrl, authRedirect, appToken } from '../consts';
import * as api from './api/index';
import {_} from '../utils';import { RedditMe } from './api/account';
import { AuthHeaders } from './api/auth-headers';
 _;

let window: BrowserWindow|null = null;
let webserver: http.Server|null = null;

const globalState:
{
	hasRSharpDir: boolean;
	hadTroubleLaunching: boolean;
	hadTroubleLaunchingReason: string;
	needsOauth: boolean;
	storedError: string;
	oauthOtc: string;
	oauthAccessToken: string;
	oauthRefreshToken: string;
	oauthExpiresAt?: Date;
	userName: string;
	userId: string;
} = 
{
	hasRSharpDir: false,
	hadTroubleLaunching: false,
	hadTroubleLaunchingReason: '',
	needsOauth: false,
	storedError: 'N-no errror?',
	oauthOtc: '',
	oauthAccessToken: '',
	oauthRefreshToken: '',
	userName: '',
	userId: '',
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
				globalState.needsOauth = true;
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
		webPreferences:
		{
			nodeIntegration: true,
		},
	});

	if (globalState.hadTroubleLaunching)
		window.loadFile(path.join(__dirname, '../renderer/error.html'))
	else
		if (globalState.needsOauth)
			getOauth();
		else
			window.loadFile(path.join(__dirname, '../renderer/index.html'));

};

const getOauth = async (): Promise<void> =>
{
	/*
	In order  to get authentication, we need to do the following:

	- Open up a Reddit authentication page.
	
	- Open a webserver.

	- Specify that the authentication page should redirect to that
	  webserver (because it can't redirect to a local file).
	
	- Have the webserver point to an HTML page containing a script
	  that uses the `ipcRenderer` to communicate back to the main
	  process what the result of the authentication page was.
	
	- Recive the response and then send a POST request to get the
	  token and refresh token.
	
	- Close the webserver.

	- Open the R# interface.
	*/
	await new Promise((resolve: (v: string) => void, reject): void =>
	{
		// Generate a unique "state" to send to reddit for authentication.
		let state: string = '';
		while (state.length < 16) state += String.fromCharCode(Math.random()*26+65);

		// Create listeners to wait for the localhost page that reddit should redirect to.

		// For when Reddit itself returns an error.
		ipcMain.on('oauth-get-otc-api-error', (e: IpcMainEvent, apiError: string): void =>
		{
			globalState.storedError = `GetOtcRedditError:${apiError}`;
			reject();
		});

		// For when the render process requests the state that was sent to Reddit, so that it can be validated.
		ipcMain.on('oauth-get-otc-get-state', (e: IpcMainEvent): void =>
		{
			e.reply('oauth-get-otc-got-state', state);
		});

		// For when the sent state and the recived state don't match.
		ipcMain.on('oauth-get-otc-state-match-error', (e: IpcMainEvent, gotState: string, expectedState: string): void =>
		{
			globalState.storedError = `GetOtcStateMatchError:${gotState}:${expectedState}`;
			reject();
		});
		
		// For when the URL doesn't match any of the expected return values from reddit.
		ipcMain.on('oauth-get-otc-url-match-error', (e: IpcMainEvent, url: string): void =>
		{
			globalState.storedError = `GetOtcUrlMatchError:${url}`;
			reject();
		});
		
		// For when we finally actually get the OTC to get the token.
		ipcMain.on('oauth-get-otc-got-otc', (e: IpcMainEvent, otc: string): void =>
		{
			globalState.storedError = 'Success!';
			globalState.oauthOtc = otc;
			resolve(otc);
		});

		// Start a webserver for handling oauth redirection.
		const expressApp: express.Express = express();
		expressApp.use('/reddit/oauth', express.static(path.join(__dirname, 'oauth-helper')));
		try
		{
			webserver = expressApp.listen(9001);
		}
		catch(err)
		{
			globalState.storedError = `GetOtcStartServerError:Webserver already listening on 9001.`;
			reject();
		}

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
		ipcMain.removeHandler('oauth-get-otc-api-error');
		ipcMain.removeHandler('oauth-get-otc-get-state');
		ipcMain.removeHandler('oauth-get-otc-state-match-error');
		ipcMain.removeHandler('oauth-get-otc-url-match-error');
		ipcMain.removeHandler('oauth-get-otc-got-otc');
		
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
	await fs.promises.writeFile
	(
		path.join(dataDir, `oauth-${globalState.userId}.lock`),
		`${
			globalState.oauthAccessToken
		}\n${
			globalState.oauthRefreshToken
		}\n${
			globalState.oauthExpiresAt?.inSeconds()
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
 * Retrives the Oauth access & refresh tokens, as well as when they expire from disk.
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
			await fs.promises.access(path.join(dataDir, `oauth-${lastAccount}.lock`))
				.then(async (): Promise<void> =>
				{
					const split: string[] = 
					(
						await fs.promises.readFile
						(
							path.join(dataDir, `oauth-${lastAccount}.lock`),
							'utf8'
						)
					).split('\n');

					// Save to `globalState`.
					globalState.oauthAccessToken = split[0];
					globalState.oauthRefreshToken = split[1];
					globalState.oauthExpiresAt = new Date(parseInt(split[2]));

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
					toReturn = new Error(`The file "oauth-${lastAccount}.lock" does not exist -- But is required by "last-account.dat".`);
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
					'Authentication': `Basic ${btoa(`${appToken}:`)}`,
					'content-type': 'application/x-www-form-urlencoded',
					'User-Agent': `R# for Reddit -- Logged in as ${globalState.userName}`,
					'x-internship': `I'm still in highschool, but an internship at Reddit would be awesome. See https://github.com/K4rakara.`
				})
			}
		)
	).json();

	// Save to `globalState`.
	globalState.oauthAccessToken = res.access_token;
	globalState.oauthRefreshToken = res.refresh_token;
	globalState.oauthExpiresAt = (new Date()).addSeconds(res.expires_in);

	// Save to disk.
	await fs.promises.writeFile
	(
		path.join(dataDir, `oauth-${globalState.userId}.lock`),
		`${
			globalState.oauthAccessToken
		}\n${
			globalState.oauthRefreshToken
		}\n${
			globalState.oauthExpiresAt?.inSeconds()
		}`
	);

	// Set a listener to refresh the token when needed.
	setTimeout((): void => { refreshToken(); }, res.expires_in * 1000 - (1000 * 60));
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
	const me: RedditMe = await api.account.getMe
	(
		globalState.oauthAccessToken,
		(globalState.userName !== '')
			? globalState.userName
			: undefined
	);
	e.reply('reply:reddit:account:get-me', me);
});