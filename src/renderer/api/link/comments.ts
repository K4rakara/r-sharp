import { ipcRenderer, IpcRendererEvent } from 'electron';
import { GetCommentsArguments } from '../../../main/api/link';
import { RedditComments } from '../../../main/api/reddit-types';

export async function getComments(link: string, args?: GetCommentsArguments|{}): Promise<RedditComments>
{
	return await new Promise((resolve: (val: RedditComments) => void): void =>
	{
		ipcRenderer.send('reddit:link:comments', link);
		ipcRenderer.once('reply:reddit:link:comments', (e: IpcRendererEvent, v: RedditComments): void => resolve(v));
	});
}