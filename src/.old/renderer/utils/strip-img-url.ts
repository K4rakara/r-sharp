export function stripImageUrl(url: string): string
{
	url = url.replace(/\?.+/gm, '');
	return url;
}