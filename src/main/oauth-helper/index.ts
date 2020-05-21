import { ipcRenderer, IpcRendererEvent } from 'electron';

const code: string|undefined = window.location.href.match(/(?<=code=)[^&?]+/)?.toString();
const error: string|undefined = window.location.href.match(/(?<=error=)[^&?]+/)?.toString();
const state: string|undefined = window.location.href.match(/(?<=state=)[^&?]+/)?.toString();

(async (): Promise<void> =>
{
	if (error != null)
		ipcRenderer.send('oauth-get-otc-api-error', error);
	else
	{
		if (code != null && state != null)
		{
			ipcRenderer.send('oauth-get-otc-get-state');
			const prevState: string|undefined = await new Promise((resolve): void =>
			{
				ipcRenderer.once('oauth-get-otc-got-state', (e: IpcRendererEvent, v: string|undefined): void =>
					resolve(v));
			});
			if (state != prevState)
				ipcRenderer.send('oauth-get-otc-state-match-error', state, prevState);
			else
				ipcRenderer.send('oauth-get-otc-got-otc', code);
		}
		else
			ipcRenderer.send('oauth-get-otc-url-match-error', window.location.href);
	}
})();