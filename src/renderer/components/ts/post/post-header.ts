import quark from '@quark.js/core';
import { PostArguments } from './post';
import { QuarkHTMLElement } from '../../../quark-element';

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
			'\n'}<div class="r-sharp-post__header__title">${
			'\n\t'}${args.constructor.link.title}${
			'\n'}</div>`;
	}
}