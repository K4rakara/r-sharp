import { ipcRenderer, IpcRendererEvent } from 'electron';
import { RedditFeed } from '../../../main/api/reddit-types';

export async function listBest(after: string|null): Promise<RedditFeed>
{
	return await new Promise((resolve: (v: RedditFeed) => void): void =>
	{
		ipcRenderer.send('reddit:listings:best', after);
		ipcRenderer.once('reply:reddit:listings:best', (e: IpcRendererEvent, v: RedditFeed): void => resolve(v));
	});
}