import { ipcRenderer, IpcRendererEvent } from 'electron';
import { RedditVoteType } from '../../../main/api/link/vote';
export { RedditVoteType } from '../../../main/api/link/vote';

export async function vote(post: string, dir: RedditVoteType): Promise<boolean>
{
	return await new Promise((resolve: (v: boolean) => void): void =>
	{
		ipcRenderer.send('reddit:link:vote', post, dir);
		ipcRenderer.once('reply:reddit:link:vote', (e: IpcRendererEvent, ok: boolean): void => resolve(ok));
	});
}