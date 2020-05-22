import quark from '@quark.js/core';
import { RedditMe } from '../../main/api/account';

interface AccountQuicklookConstructor { me: RedditMe }

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

		el.appendChild(accountQuicklookContainer);
	}
}