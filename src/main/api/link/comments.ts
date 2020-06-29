import fetch, { Request, Response } from 'node-fetch';
import { AuthHeaders } from '../auth-headers';
import { oauthRedditUrl } from '../../../consts';
import { RedditComments } from '../reddit-types';
import * as utils from '../../../utils';
import * as logging from '../../logging';

export interface GetCommentsArguments
{
	context: 0|1|2|3|4|5|6|7|8;
	comment?: string;
	depth?: number;
	limit?: number;
	showedits?: boolean;
	showmore?: boolean;
	sort: 'confidence'|'top'|'new'|'controversial'|'old'|'random'|'qa'|'live';
	sr_detail?: boolean;
	threaded: boolean;
	truncate: number;
}

export async function getComments(link: string, token: string, user: string, arg: GetCommentsArguments|{}): Promise<RedditComments>
{
	if (!(arg != null)) arg = {};
	//@ts-ignore
	const url: string = `${oauthRedditUrl}/comments/${link}/${utils.objectToQueryParams(arg)}&raw_json=1`;
	const req: Request = new Request(url, { headers: new AuthHeaders(token, {}, user) });
	logging.reqLog(req);
	const res: Response = await fetch(req);
	logging.resLog(req, res);
	return await res.json();
}