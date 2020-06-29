import { ipcRenderer, IpcRendererEvent } from 'electron';

ipcRenderer.send('get-stored-error');
ipcRenderer.once('got-stored-error', (e: IpcRendererEvent, err: string): void =>
{
	const el: HTMLElement|null = document.querySelector('#err-details');
	if (el != null)
	{
		el.innerHTML = err;
	}
});