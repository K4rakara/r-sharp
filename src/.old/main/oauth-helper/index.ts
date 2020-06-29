import { ipcRenderer, IpcRendererEvent } from 'electron';

const code: string|undefined = window.location.href.match(/(?<=code=)[^&?]+/)?.toString();
const error: string|undefined = window.location.href.match(/(?<=error=)[^&?]+/)?.toString();
const state: string|undefined = window.location.href.match(/(?<=state=)[^&?]+/)?.toString();

(async (): Promise<void> =>
{
	if (error != null)
		ipcRenderer.send('reddit:get-otc:reddit-error', error);
	else
	{
		if (code != null && state != null)
		{
			ipcRenderer.send('reddit:get-otc:get-state');
			const prevState: string|undefined = await new Promise((resolve): void =>
			{
				ipcRenderer.once('reply:reddit:get-otc:get-state', (e: IpcRendererEvent, v: string|undefined): void =>
					resolve(v));
			});
			if (state != prevState)
				ipcRenderer.send('reddit:get-otc:state-error', state, prevState);
			else
				ipcRenderer.send('reddit:get-otc:otc', code);
		}
		else
			ipcRenderer.send('reddit:get-otc:url-error', window.location.href);
	}
})();