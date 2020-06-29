import chalk from 'chalk';
import {_} from '../stdext'; _;
import { Request, Response } from 'node-fetch';
import { stat } from 'fs';

function makeLogPrefix(): string
{
	return `[${new Date().toTimeLike12()} ${new Date().toDateLike()}]: `;
}

export function log(msg: string): void
{
	console.log(`${makeLogPrefix()}${msg}`);
}

export function warn(msg: string): void
{
	log(chalk.yellow`${msg}`);
}

export function error(msg: string): void
{
	log(chalk.red`${msg}`);
}

export function reqLog(req: Request): void
{
	console.log('');
	const headers: string = ((): string =>
	{
		let toReturn: string = '';
		req.headers.forEach((v: string, k: string): void =>
			{ toReturn += `\n\t${k} : ${v}`; });
		return toReturn;
	})();
	log(`-> ${chalk.magenta`REQUEST`} ${chalk.green`${req.method}`} ${chalk.blue`${req.url}`}${headers}\n`);
}

export function resLog(req: Request, res: Response): void
{
	console.log('');
	const status: string = ((): string =>
	{
		const good: number[] = [ 200, 304 ];
		const fine: number[] = [ 201, 202, 203, 204, 205, 206 ];
		const iffy: number[] = [ 300, 301, 302, 303, 305, 306, 307, 308 ];
		const bad: number[] = [
			400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412,
			413, 414, 415, 416, 417, 421, 422, 423, 424, 425, 426, 428, 429,
			431, 451, 500, 501, 502, 503, 504, 505, 506, 507, 508, 510, 511,
		];
		if (good.includes(res.status))
			return chalk.green`${res.status} (${res.statusText})`;
		else if (fine.includes(res.status))
			return chalk.blue`${res.status} (${res.statusText})`;
		else if (iffy.includes(res.status))
			return chalk.yellow`${res.status} (${res.statusText})`;
		else if (bad.includes(res.status))
			return chalk.red`${res.status} (${res.statusText})`;
		else
			return chalk.white`${res.status} (${res.statusText})`;
	})();
	const headers: string = ((): string =>
	{
		let toReturn: string = '';
		res.headers.forEach((v: string, k: string): void =>
			{ toReturn += `\n\t${k} : ${
				(v.length < 80)
					? v
					: `${v.substring(0, 77)}...`
			}`; });
		return toReturn;
	})();
	log(`<- ${chalk.magenta`RESPONSE`} ${chalk.green(req.method)} ${chalk.blue(req.url)} : ${status} ${headers}\n`);
}