import quark from '@quark.js/core';
import {
	Card,
	Post,
	UpvoteButton,
	DownvoteButton,
	PostHeader,
	PostPreview,
	PostVoting,
} from '../../components/ts';
import { RedditLink, RedditFeed } from '../../../main/api/reddit-types';
import * as api from '../../api';
import * as utils from '../../utils';
import { IfcFrame, IfcFrameEvent } from '../ifc-frame';

quark.registerComponent('card', Card);
quark.registerComponent('post', Post);
quark.registerComponent('post__header', PostHeader);
quark.registerComponent('post__preview', PostPreview);
quark.registerComponent('post__voting', PostVoting);
quark.registerComponent('upvote-button', UpvoteButton);
quark.registerComponent('downvote-button', DownvoteButton);

class Explore
{
	public posts: RedditLink[] = [];
	constructor()
	{
		(async (): Promise<void> =>
		{
			const postsElement: HTMLElement|null = document.querySelector('main #posts');
			if (postsElement != null)
			{
				const feed: RedditFeed = await api.listings.listBest(null);
				this.posts.push(...feed.data.children);
				this.posts.forEach((post: any): void =>
				{
					quark.append
					(
						postsElement,
						{
							tag: 'div',
							component: 'post',
							constructor: { link: post.data },
							element: {},
						}
					);
				});
			}
		})();
	}
}

const explore = new Explore();

const toBeCalled = (): void => console.log('success!');

(<any>window).ifcFrame = new IfcFrame();
(<any>window).ifcFrame.once('initialize', (e: IfcFrameEvent, ...args: any): void =>
{
	e.reply('reply:initialize', 'OK');
});

(<any>window).ifcFrame.once('test', (): void =>
{
	toBeCalled();
});