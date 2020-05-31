import quark from '@quark.js/core';
import { QuarkHTMLElement } from '../../../quark-element';
import { RedditLink } from '../../../../main/api/reddit-types';
import * as utils from '../../../utils';
import * as api from '../../../api';
import { RedditVoteType } from '../../../api/link';

export interface PostConstructor
{
	link: RedditLink;
	readyForFullLoad: Promise<void>;
}

export interface PostArguments
{
	tag?: string;
	constructor: PostConstructor;
	component: 'post';
	element: any;
}

export class Post extends quark.Component
{
	
	#QuarkData = class
	{
		#element: QuarkHTMLElement;
		#voting?: QuarkHTMLElement;
		#link: RedditLink;

		get upvoted(): boolean
		{
			if (this.#voting != null)
			{
				return this.#voting.quark.upvoted;
			} else this.#panic();
			return false;
		}

		get link(): RedditLink { return this.#link; }

		public upvote(): void
		{
			if (this.#voting != null)
			{
				this.#voting.quark.upvote();
			} else this.#panic();
		}

		public unupvote(): void
		{
			if (this.#voting != null)
			{
				this.#voting.quark.unupvote();
			} else this.#panic();
		}

		get downvoted(): boolean
		{
			if (this.#voting != null)
			{
				return this.#voting.quark.downvoted;
			} else this.#panic();
			return false;
		}

		public downvote(): void
		{
			if (this.#voting != null)
			{
				this.#voting.quark.downvote();
			} else this.#panic();
		}

		public undownvote(): void
		{
			if (this.#voting != null)
			{
				this.#voting.quark.undownvote();
			} else this.#panic();
		}

		#panic = (): void =>
		{
			this.#element.remove();
			console.log('A PostVoting component lacks one or more of its required components, and as such can no longer function. The component will be removed.');
		}

		constructor(el: QuarkHTMLElement, link: RedditLink)
		{
			this.#element = el;
			this.#link = link;
			const postVoting: HTMLElement|null = this.#element.querySelector('.r-sharp-post__left .r-sharp-post__voting');
			if (postVoting != null)
			{
				this.#voting = <QuarkHTMLElement>postVoting;
			} else this.#panic();
		}
	}

	constructor(el: QuarkHTMLElement, args: PostArguments)
	{
		super(el, args);

		const postContainer: HTMLDivElement = document.createElement('div');
		postContainer.classList.add('r-sharp-post');
		
		const postLeft: HTMLDivElement = document.createElement('div');
		postLeft.classList.add('r-sharp-post__left');

		const postVoting: HTMLDivElement = document.createElement('div');
		postVoting.classList.add('r-sharp-post__voting');
		quark.replace
		(
			postVoting,
			{
				component: 'post__voting',
				constructor: { link: args.constructor.link, post: el },
				element: {}
			}
		);
		postLeft.appendChild(postVoting);

		postContainer.appendChild(postLeft);

		const postRight: HTMLDivElement = document.createElement('div');
		postRight.classList.add('r-sharp-post__right');

		const postHeader: HTMLDivElement = document.createElement('div');
		postHeader.classList.add('r-sharp-post__header');
		quark.replace
		(
			postHeader,
			{
				component: 'post__header',
				constructor: { link: args.constructor.link },
				element: {},
			}
		);
		postRight.appendChild(postHeader);

		const postPreview: HTMLDivElement = document.createElement('div');
		postPreview.classList.add('r-sharp-post__preview');
		quark.replace
		(
			postPreview,
			{
				component: 'post__preview',
				constructor: { link: args.constructor.link, readyForFullLoad: args.constructor.readyForFullLoad },
				element: {}
			}
		);
		postRight.appendChild(postPreview);

		const postButtons: HTMLDivElement = document.createElement('div');
		postButtons.classList.add('r-sharp-post__buttons');
		quark.replace
		(
			postButtons,
			{
				component: 'post__buttons',
				constructor: { link: args.constructor.link },
				element: {}
			}
		);
		postRight.appendChild(postButtons);

		postContainer.appendChild(postRight);

		el.appendChild(postContainer);

		el.quark = new this.#QuarkData(el, args.constructor.link);
	}

}
