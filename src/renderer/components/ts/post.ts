import quark from '@quark.js/core';
import { Card } from './card';
import { QuarkHTMLElement } from '../../quark-element';
import { RedditLink } from '../../../main/api/reddit-types';

interface PostConstructor
{
	link: RedditLink;
}

interface PostArguments
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

		constructor(el: QuarkHTMLElement)
		{
			this.#element = el;
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
		/* quark.replace
		(
			postVoting,
			{
				component: 'voting',
				constructor: { link: args.constructor.link },
				element: {}
			}
		); */
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
				constructor: { link: args.constructor.link },
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

		el.quark = new this.#QuarkData(el);
	}

}

export class PostHeader extends quark.Component
{
	constructor(el: QuarkHTMLElement, args: PostArguments)
	{
		super(el, args);

		el.innerHTML +=
			`<div class="r-sharp-post__header__via">${
			'\n\t'}<div class="r-sharp-post__header__via__subreddit">${
			'\n\t\t'}${args.constructor.link.subreddit_name_prefixed}${
			'\n\t'}</div>${
			'\n\t'}<div class="r-sharp-post__header__via__user">${
			'\n\t\t'}Posted by <span class="r-sharp-post__header__via__user-link">${
			'\n\t\t\t'}u/${args.constructor.link.author.toLowerCase()}${
			'\n\t\t'}</span>${
			'\n\t'}</div>${
			'\n'}</div>${
			'\n'}<div class="r-sharp-psot__header__title">${
			'\n\t'}${args.constructor.link.title}${
			'\n'}</div>`;
	}
}