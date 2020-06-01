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
	public snackbarContainer?: HTMLElement;

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

		const snackbarContainer: HTMLElement|null = document.querySelector('snackbars');
		if (snackbarContainer != null)
		{
			this.snackbarContainer = snackbarContainer;
			const oldAppendChild = this.snackbarContainer.appendChild;
			this.snackbarContainer.appendChild = (child) =>
			{
				const oldRemove = (<any>child).remove;
				(<any>child).remove = () =>
				{
					if (this.snackbarContainer != null && this.snackbarContainer.children.length === 1)
						this.snackbarContainer.removeAttribute('shadow');
					oldRemove.call(child);
				};
				if (this.snackbarContainer != null) this.snackbarContainer.setAttribute('shadow', '');
				return <any>oldAppendChild.call(this.snackbarContainer, child);
			};
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