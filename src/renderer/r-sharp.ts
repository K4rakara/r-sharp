import quark from '@quark.js/core';
import * as Kuudere from 'kuudere';
import { AccountQuicklook } from './components/ts/account-quicklook';
import * as api from './api/index';
import { RedditMe } from "../main/api/account";
import ifcRoot, { IfcRoot, IfcRootEvent } from './tabs/ifc-root';
import { IfcFrame } from './tabs/ifc-frame';
import { QuarkHTMLElement } from './quark-element';
import { RedditLink } from '../main/api/reddit-types';

export class RSharp
{
	public currentUser?: RedditMe;
	public accountQuicklook: HTMLElement;
	//@ts-ignore
	public accountDetails: QuarkHTMLElement;
	public tabs: HTMLElement;
	public snackbars: HTMLElement;
	//@ts-ignore
	public overlays: HTMLElement;

	public exploreFrame?: IfcFrame;
	public ifcRoot: IfcRoot;
	public tooltipQuickOpen: boolean = false;
	public tooltipStopQuickOpening: number|null = null;

	constructor(exploreFrame: Promise<IfcFrame>)
	{
		this.ifcRoot = new IfcRoot();

		exploreFrame.then((tab: IfcFrame): void => { this.exploreFrame = tab; });
		
		const globalHeader: HTMLElement|null = document.querySelector('body main header #global-header');
		const localHeader: HTMLElement|null = document.querySelector('body main header #local-header');

		if (globalHeader != null && localHeader != null)
		{
			// Begin global header init ===========================================================

			// Begin account quicklook init =======================================================

			const me: Promise<RedditMe> = api.account.getMe();
			this.accountQuicklook = Kuudere.constructComponent
			(
				'span',
				AccountQuicklook,
				{
					constructor: me,
					listeners:
					{
						'mouseup': (e: MouseEvent): void =>
						{
							this.accountDetails.quark.open();
						}
					}
				}
			);
			globalHeader.appendChild(this.accountQuicklook);
			me.then((me: RedditMe): void => { this.currentUser = me; });

			// End account quicklook init =========================================================

			// Begin tabs init ====================================================================
	
			this.tabs = globalHeader.appendChild
			(
				quark.replace
				(
					document.createElement('span'),
					{ component: 'tabs', constructor: {}, element: {} }
				)!
			);

			// End tabs init ======================================================================

			// End global header init =============================================================

			// Begin snackbar container init ======================================================

			const snackbars: HTMLElement|null = document.querySelector('snackbars');
			if (snackbars != null)
			{
				this.snackbars = snackbars;
				const oldAppendChild = this.snackbars.appendChild;
				this.snackbars.appendChild = (child) =>
				{
					const oldRemove = (<any>child).remove;
					(<any>child).remove = () =>
					{
						if (this.snackbars != null && this.snackbars.children.length === 1)
							this.snackbars.removeAttribute('shadow');
						oldRemove.call(child);
					};
					if (this.snackbars != null) this.snackbars.setAttribute('shadow', '');
					return <any>oldAppendChild.call(this.snackbars, child);
				};
			}
			else throw new Error('The snackbar container could not be found. This is not a recoverable error.');

			// End snackbar container init ========================================================

			// Begin account details init =========================================================
			me.then((v: RedditMe): void =>
			{
				const overlays: HTMLElement|null = document.querySelector('overlays');
				if (overlays != null)
				{
					this.overlays = overlays;
					this.accountDetails = <QuarkHTMLElement>this.overlays.appendChild
					(
						quark.replace
						(
							document.createElement('div'),
							{
								component: 'account-details',
								constructor: { me: v },
								element: {}
							}
						)!
					);
				}
				else throw new Error('The overlays container could not be found. This is not a recoverable error.')
			});

			// End account details init ===========================================================

			// Begin ifc channels init ============================================================

			this.ifcRoot.on
			(
				'r-sharp:show-share-menu',
				(
					e: IfcRootEvent,
					data: { type: 'link:image', v: RedditLink }
						|{ type: 'link:video', v: RedditLink }
						|{ type: 'link:text', v: RedditLink }
				): void =>
				{
					switch (data.type)
					{
						case 'link:image':
							{

							}
							break;
					}
				}
			);

			// End ifc channels init ==============================================================
		}
		else throw new Error('Either the local header or the global header could not be found. This is not a recoverable error.');
	}
}