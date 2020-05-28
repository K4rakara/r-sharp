import url from 'url';
import path from 'path';

export const getDefaultProfilePictureUrl = (): string =>
{
	const parsed: url.Url = url.parse(window.location.href);
	if (!parsed.path?.includes('/tabs/'))
	{
		const joined: string = path.join(parsed.path || '', 'assets/avatar.png');
		return `file:///${joined}`;
	}
	else
	{
		const joined: string = path.join(parsed.path || '', '../../assets/avatar.png');
		return `file:///${joined}`;
	}
};