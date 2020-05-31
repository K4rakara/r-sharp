import quark from '@quark.js/core';
import * as api from './api/index';
import { RedditMe } from "../main/api/account";
import ifcRoot, { IfcRoot } from './tabs/ifc-root';
import { IfcFrame } from './tabs/ifc-frame';

export class RSharp
{
	public currentUser?: RedditMe;
	public accountQuicklook?: HTMLElement;
	public tabs?: HTMLElement;
	public exploreFrame?: IfcFrame;
	public ifcRoot: IfcRoot;
	public tooltipQuickOpen: boolean = false;
	public tooltipStopQuickOpening: number|null = null;

	constructor(exploreFrame: Promise<IfcFrame>)
	{
		this.ifcRoot = new IfcRoot();

		exploreFrame.then((tab: IfcFrame): void => { this.exploreFrame = tab; });

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
		
		const accountQuicklook: HTMLElement|null = document.querySelector('header #account-quicklook');
		if (accountQuicklook != null)
		{
			this.accountQuicklook = accountQuicklook;
			const me: Promise<RedditMe> = api.account.getMe();
			quark.replace
			(
				accountQuicklook,
				{
					component: 'account-quicklook',
					constructor: { me: me },
					element: {}
				}
			);
			me.then((me: RedditMe): void =>
			{
				this.currentUser = me;
			});
		}
	}
}