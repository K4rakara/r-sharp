declare global
{
	interface Date
	{
		addSeconds(s: number): Date;
		inSeconds(): number;
		isPast(d: Date): boolean;
	}
}

Date.prototype.addSeconds = function(s: number): Date
{
	this.setSeconds(this.getSeconds() + s);
	return this;
}

Date.prototype.inSeconds = function(): number
{
	return Math.round(this.getTime() / 1000);
}

Date.prototype.isPast = function(d: Date): boolean
{
	return (this.inSeconds() > d.inSeconds());
}

export const _ = null;

export function HTTPDump(req: Request, res: Response): void
{
	console.log(`# HTTP`);
	console.log(`Request URL: ${req.url}`);
	console.log(`Request method: ${req.method}`);
	console.log(`Status code: ${res.status}; ${res.statusText}`);
	console.log(`### Request headers:`);
	console.log(((): string =>
	{
		let toReturn: string = '';
		toReturn += `|Key|Value|\n`;
		toReturn += `|---|-----|\n`;
		req.headers.forEach((v: string, k: string): void =>
		{
			toReturn += `|${k}|${v}|\n`;
		});
		return toReturn;
	})());
	console.log('');
	console.log(`### Response headers:`);
	console.log(((): string =>
	{
		let toReturn: string = '';
		toReturn += `|Key|Value|\n`;
		toReturn += `|---|-----|\n`;
		res.headers.forEach((v: string, k: string): void =>
		{
			toReturn += `|${k}|${v}|\n`;
		});
		return toReturn;
	})());
}

export function objectToQueryParams(obj: { [key: string]: { [key: string]: any; toString: typeof toString; }|string|number; }): string
{
	let toReturn: string =  '';
	let first: boolean = true;
	Object.keys(obj).forEach((k: string): void =>
	{
		if (first)
			toReturn += `?${k}=${obj[k].toString()}`;
		else
			toReturn += `&${k}=${obj[k].toString()}`;
		first = false;
	});
	return toReturn;
}