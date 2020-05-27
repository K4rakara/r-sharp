import quark from '@quark.js/core';
import { RedditMe } from '../../../main/api/account';
import { karmaSvgIcon } from '../../../consts';
import * as utils from '../../utils';

interface AccountQuicklookConstructor { me: Promise<RedditMe> }

interface AccountQuicklookArguments
{
	tag?: string;
	component: string;
	constructor: AccountQuicklookConstructor;
	element: any;
}

export class AccountQuicklook extends quark.Component
{
	constructor(el: HTMLElement, args: AccountQuicklookArguments)
	{
		super(el, args);

		const accountQuicklookContainer: HTMLDivElement = document.createElement('div');
		accountQuicklookContainer.classList.add('r-sharp-account-quicklook');
		
		const accountQuicklookProfilePicture: HTMLDivElement = document.createElement('div');
		accountQuicklookProfilePicture.classList.add('r-sharp-account-quicklook__profile-picture');
		quark.replace
		(
			accountQuicklookProfilePicture,
			{
				component: 'profile-picture',
				constructor: { src: args.constructor.me.subreddit.icon_img },
				element: {}
			}
		);
		accountQuicklookContainer.appendChild(accountQuicklookProfilePicture);

		accountQuicklookContainer.innerHTML +=
			`<div class="r-sharp-account-quicklook__account-details">${
			'\n\t'}<div class="r-sharp-account-quicklook__key-details">${
			'\n\t\t'}${args.constructor.me.subreddit.display_name_prefixed}${
				(args.constructor.me.is_gold)
					? `\n\t\t<i class="r-sharp-icons__reddit-premium"></i>`
					: ''}${
			'\n\t</div>'}${
			'\n\t'}<div class="r-sharp-account-quicklook__lesser-details">${	
			'\n\t\t'}<span class="r-sharp-account-quicklook__karma">${
			'\n\t\t\t'}${karmaSvgIcon}${
			'\n\t\t\t'}${utils.prettyNumber(args.constructor.me.link_karma + args.constructor.me.comment_karma)}${
			'\n\t\t'}</span>${
			'\n\t\t'}<span class="r-sharp-account-quicklook__coins">${
			'\n\t\t\t'}<i class="r-sharp-icons__reddit-coin"></i>${
			'\n\t\t\t'}${utils.prettyNumber(args.constructor.me.gold_creddits)}${
			'\n\t\t'}</span>${
			'\n\t'}</div>${
			'\n'}</div>`;

		el.appendChild(accountQuicklookContainer);
	}
}