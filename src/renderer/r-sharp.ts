import quark from '@quark.js/core';
import * as api from './api/index';
import { RedditMe } from "../main/api/account";

export class RSharp
{
	public currentUser?: RedditMe;
	public accountQuicklook?: HTMLElement;
	public tabs?: HTMLElement;

	constructor()
	{
		const tabs: HTMLElement|null = document.querySelector('header #tabs');
		if (tabs != null)
		{
			this.tabs = tabs;
			quark.replace
			(
				tabs,
				{
					component: 'tabs',
					constructor: {},
					element: {}
				}
			);
		}
		(async (): Promise<void> =>
		{
			this.currentUser = await api.account.getMe();
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
				}
			}
		})();
	}
}