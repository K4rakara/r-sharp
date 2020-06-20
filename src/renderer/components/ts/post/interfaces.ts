import * as Kuudere from 'kuudere';
import { RedditLink } from "../../../../main/api/reddit-types";
export { RedditLink } from "../../../../main/api/reddit-types";

export interface PostConstructor
{
	link: RedditLink;
	readyForFullLoad: Promise<void>;
}

export interface PostChildConstructor extends PostConstructor
{
	parent: Kuudere.HTMLKuudereComponent<any>;
}