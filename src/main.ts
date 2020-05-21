import path from 'path';
import fs from 'fs';
import http from 'http';
import { app, BrowserWindow, ipcMain, IpcMainEvent } from 'electron';
import express from 'express';
import fetch, { Headers } from 'node-fetch';
import btoa from 'btoa';
import { dataDir, redditUrl, authRedirect, appToken } from './consts';
import * as api from './api/index';
import {_} from './utils';
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
	oauthToken: string;
	oauthRefreshToken: string;
	oauthExpiresAt?: Date;
	userName: string;
} = 
{
	hasRSharpDir: false,
	hadTroubleLaunching: false,
	hadTroubleLaunchingReason: '',
	needsOauth: false,
	storedError: 'N-no errror?',
	oauthOtc: '',
	oauthToken: '',
	oauthRefreshToken: '',
	userName: '',
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
		fs.promises.access(path.join(dataDir, 'oauth.lock'))
			.then((): void =>
			{
				fs.promises.readFile(path.join(dataDir, 'oauth.lock'), 'utf8')
					.then((v: string): void =>
					{
						const split: string[] = v.split('\n');
						globalState.oauthToken = split[0];
						globalState.oauthRefreshToken = split[1];
						globalState.oauthExpiresAt = new Date(parseInt(split[2]));
					});
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
		window.loadFile(path.join(__dirname, 'error.html'))
	else
		if (globalState.needsOauth)
			getOauth();
		else
			window.loadFile(path.join(__dirname, 'index.html'));

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
	await new Promise((resolve, reject): void =>
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
			resolve();
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
	.then(async (): Promise<void> =>
	{
		try
		{
			const token: RedditOauthTokenResponse = await
			(
				await fetch
				(
					`${redditUrl}/api/v1/access_token`, 
					{
						method: 'POST',
						body: `grant_type=authorization_code&code=${globalState.oauthOtc}&redirect_uri=${authRedirect}`,
						headers: new Headers
						({
							'Authorization': `Basic ${btoa(`${appToken}:`)}`,
							'content-type': 'application/x-www-form-urlencoded',
							'User-Agent': `R# for Reddit -- Not logged in`
						}),
					}
				)
			).json();
			globalState.oauthToken = token.access_token;
			globalState.oauthRefreshToken = token.refresh_token;
			//@ts-ignore
			globalState.oauthExpiresAt = (new Date()).addSeconds(token.expires_in);
			await fs.promises.writeFile(path.join(dataDir, 'oauth.lock'), `${globalState.oauthToken}\n${globalState.oauthRefreshToken}\n${globalState.oauthExpiresAt?.getTime() || 0 / 1000}`);
			globalState.userName = (await api.account.getMe(globalState.oauthToken)).subreddit.display_name_prefixed;
			window?.loadFile(path.join(__dirname, 'index.html'));
		}
		catch(err)
		{
			globalState.storedError = `GetOauthTokenError:${err}`;
		}
	})
	.catch((): void =>
	{
		window?.loadFile(path.join(__dirname, 'error.html'));
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