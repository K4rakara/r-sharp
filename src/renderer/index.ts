// Imports.
import quark from '@quark.js/core';
import { ipcRenderer } from 'electron';
import {
	UpvoteButton,
	DownvoteButton,
	Post,
	AccountQuicklook,
	ProfilePicture,
	Tabs,
	Tooltip,
	Snackbar,
	AccountDetails,
} from './components/ts/index';
import * as api from './api/index';
import { RSharp } from './r-sharp';
import { IfcFrame } from './tabs/ifc-frame';
import { IfcRootEvent } from './tabs/ifc-root';

// Register components.
quark.registerComponent('upvote-button', UpvoteButton);
quark.registerComponent('downvote-button', DownvoteButton);
quark.registerComponent('post', Post);
quark.registerComponent('account-quicklook', AccountQuicklook);
quark.registerComponent('profile-picture', ProfilePicture);
quark.registerComponent('tabs', Tabs);
quark.registerComponent('tooltip', Tooltip);
quark.registerComponent('snackbar', Snackbar);
quark.registerComponent('account-details', AccountDetails);

// Create promises for if the iframes have loaded yet.
const exploreLoaded: Promise<IfcFrame> = new Promise((resolve: (v: IfcFrame) => void, reject): void =>
{
	const exploreElement: HTMLIFrameElement|null = document.querySelector('content #explore');
	if (exploreElement != null)
	{
		const exploreNullable: IfcFrame|null = (<any>exploreElement.contentWindow)['ifcFrame'];
		if (exploreNullable != null)
			resolve(exploreNullable);
		else
		{
			const interval: any = setInterval((): void =>
			{
				const exploreNullable: IfcFrame|null = (<any>exploreElement.contentWindow)['ifcFrame'];
				if (exploreNullable != null)
				{
					clearInterval(interval);
					resolve(exploreNullable);
				}
			}, 100);
		}
	}
	else reject('Element does not exist!');
});

// Create the app state.
window.rSharp = new RSharp(exploreLoaded);
const rSharp: RSharp = window.rSharp;

exploreLoaded.then((): void =>
{
	rSharp.ifcRoot.send(rSharp.exploreFrame || new IfcFrame(), 'initialize');
	rSharp.ifcRoot.once('reply:initialize', (e: IfcRootEvent, ok: string): void =>
	{
		rSharp.ifcRoot.send(rSharp.exploreFrame || new IfcFrame(), 'test');
	});
});

// Tooltip ifc channels.
// ================================================================================================

rSharp.ifcRoot.on('r-sharp:set-tooltip-quick-open', (e: IfcRootEvent, to: boolean): void =>
{
	rSharp.tooltipQuickOpen = to;
});

rSharp.ifcRoot.on('r-sharp:get-tooltip-quick-open', (e: IfcRootEvent): void =>
{
	e.reply('reply:r-sharp:get-tooltip-quick-open', rSharp.tooltipQuickOpen);
});

rSharp.ifcRoot.on('r-sharp:get-tooltip-timeout', (e: IfcRootEvent): void =>
{
	e.reply('reply:r-sharp:get-tooltip-timeout', rSharp.tooltipStopQuickOpening);
});

rSharp.ifcRoot.on('r-sharp:start-tooltip-timeout', (e: IfcRootEvent): void =>
{
	rSharp.tooltipStopQuickOpening = window.setTimeout((): void =>
	{
		rSharp.tooltipQuickOpen = false;
	}, 500);
});

rSharp.ifcRoot.on('r-sharp:clear-tooltip-timeout', (e: IfcRootEvent): void =>
{
	if (rSharp.tooltipStopQuickOpening != null) window.clearTimeout(rSharp.tooltipStopQuickOpening);
	rSharp.tooltipStopQuickOpening = null;
});

// Snackbar ifc channels
// ================================================================================================

rSharp.ifcRoot.on('r-sharp:create-snackbar', (e: IfcRootEvent, v: any): void =>
{
	rSharp.snackbars.appendChild
	(
		quark.replace
		(
			document.createElement('div'),
			{
				component: 'snackbar',
				constructor: { ...v },
				element: {}
			}
		) || document.createElement('div')
	)
});
