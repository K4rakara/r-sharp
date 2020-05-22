import quark from '@quark.js/core';
import * as api from './api/index';
import { RedditMe } from "../main/api/account";

export class RSharp
{
	public currentUser?: RedditMe;
	public accountQuicklook?: HTMLElement;

	constructor()
	{
		console.log('hi');
		(async (): Promise<void> =>
		{
			console.log('hiya');
			this.currentUser = await api.account.getMe();
			console.log('heyo');
			{
				const accountQuicklook: HTMLElement|null = document.querySelector('header #account-quicklook');
				if (accountQuicklook != null)
				{
					this.accountQuicklook = accountQuicklook;
					quark.replace
					(
						accountQuicklook,
						{
							component: 'account-quicklook',
							constructor: { me: this.currentUser },
							element: {}
						}
					);
				} else alert("err");
			}

		})();
	}
}