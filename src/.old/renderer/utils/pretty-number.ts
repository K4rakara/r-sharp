
export function prettyNumber(from: number): string
{
	if (from >= 1024)
		if (from >= 1024000)
			return `${Math.round(from / 100000) / 10}m`;
		else
			return `${Math.round(from / 100) / 10}k`
	else
		return `${from}`;
}