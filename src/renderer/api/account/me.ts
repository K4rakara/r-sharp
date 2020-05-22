import { ipcRenderer, IpcRendererEvent } from 'electron';
import { RedditMe } from '../../../main/api/account/me';

export async function getMe(): Promise<RedditMe>
{
	return await new Promise((resolve): void =>
	{
		ipcRenderer.send('reddit:account:get-me');
		ipcRenderer.once('reply:reddit:account:get-me', (e: IpcRendererEvent, me: RedditMe): void =>
		{
			resolve(me);
		})
	});
}
