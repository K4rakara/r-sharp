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

// Create promises for if the iframes have loaded yet.
const exploreLoaded: Promise<IfcFrame> = new Promise((resolve: (v: IfcFrame) => void, reject): void =>
{
	const exploreElement: HTMLIFrameElement|null = document.querySelector('#explore');
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
const rSharp: RSharp = new RSharp(exploreLoaded);

exploreLoaded.then((): void =>
{
	rSharp.ifcRoot.send(rSharp.exploreFrame || new IfcFrame(), 'initialize');
	rSharp.ifcRoot.once('reply:initialize', (e: IfcRootEvent, ok: string): void =>
	{
		rSharp.ifcRoot.send(rSharp.exploreFrame || new IfcFrame(), 'test');
	});
});