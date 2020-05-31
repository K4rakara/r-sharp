import { ipcRenderer, IpcRendererEvent } from 'electron';

export async function save(link: string, save?: boolean): Promise<boolean>
{
	return await new Promise((resolve: (v: boolean) => void): void =>
	{
		ipcRenderer.send('reddit:link:save', link, save);
		ipcRenderer.once('reply:reddit:link:save', (e: IpcRendererEvent, ok: boolean): void => resolve(ok));
	});
}