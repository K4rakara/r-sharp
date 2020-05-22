import { ipcRenderer, IpcRendererEvent } from 'electron';

export async function fetchImageUrl(url: string): Promise<string>
{
	const token: string = await new Promise((resolve): void =>
	{
		ipcRenderer.send('get-token');
		ipcRenderer.once('reply:get-token', (e: IpcRendererEvent, token: string): void => resolve(token));
	});

	const rawImage: string = await
	(
		await fetch
		(
			url,
			{
				referrer: 'https://www.reddit.com/',
				headers: new Headers
				({
					'Cookie': `__qca=${token}`,
					'Host': 'styles.redditmedia.com'
				})
			}
		)
	).text();

	const imageType: Headers =
	(
		await fetch
		(
			url,
			{
				referrer: 'http://www.reddit.com',
				headers: new Headers
				({
					'Cookie': `__qca=${token}`,
					'Host': 'styles.redditmedia.com'
				})
			}
		)
	).headers

	return `data:${imageType['content-type']},${btoa(rawImage)}`;
}