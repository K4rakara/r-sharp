import quark from '@quark.js/core';
import {
	Card,
	Post,
	VoteButton,
	UpvoteButton,
	DownvoteButton,
	Voting,
	PostHeader,
} from '../../components/ts';
import { RedditLink, RedditFeed } from '../../../main/api/reddit-types';
import * as api from '../../api';

quark.registerComponent('card', Card);
quark.registerComponent('post', Post);
quark.registerComponent('post__header', PostHeader);
quark.registerComponent('vote-button', VoteButton);
quark.registerComponent('upvote-button', UpvoteButton);
quark.registerComponent('downvote-button', DownvoteButton);
quark.registerComponent('voting', Voting);

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
