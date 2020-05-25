import quark from '@quark.js/core';
import { MDCRipple } from '@material/ripple';
import { QuarkHTMLElement } from '../../quark-element';

export class Tabs extends quark.Component
{

	#QuarkData = class
	{
		#element: QuarkHTMLElement;
		#explore?: QuarkHTMLElement;
		#chat?: QuarkHTMLElement;
		#notifications?: QuarkHTMLElement;
		#underlay?: QuarkHTMLElement;

		get explore(): QuarkHTMLElement
		{
			if (this.#explore != null)
				return this.#explore;
			else
			{
				this.#panic();
				return <QuarkHTMLElement>(<any>document.createElement('div'));
			}
		}

		get chat(): QuarkHTMLElement
		{
			if (this.#chat != null)
				return this.#chat;
			else
			{
				this.#panic();
				return <QuarkHTMLElement>(<any>document.createElement('div'));
			}
		}

		get notifications(): QuarkHTMLElement
		{
			if (this.#notifications != null)
				return this.#notifications;
			else
			{
				this.#panic();
				return <QuarkHTMLElement>(<any>document.createElement('div'));
			}
		}

		public switchTo(to: string): void
		{
			if (this.#element.children[1] != null)
			{
				Array.from(this.#element.children[1].children).forEach((el: Element): void =>
				{
					(<QuarkHTMLElement>(<any>el)).quark.deactivate();
				});
			}
			else this.#panic();
			switch (to)
			{
				case 'explore':
					this.explore.quark.activate();
					this.#underlay?.quark.switchTo(0);
					break;
				case 'chat':
					this.chat.quark.activate();
					this.#underlay?.quark.switchTo(1);
					break;
				case 'notifications':
					this.notifications.quark.activate();
					this.#underlay?.quark.switchTo(2);
					break;
				default:
					console.log(`Invalid argument passed to Tabs.switchTo: Expected 'explore', 'chat', or 'notifications', got '${to}'.`);
			}
		}

		#panic = (): void =>
		{
			this.#element.remove();
			console.log('A Tabs component was altered in a way that it can no longer function. It will be disposed.');
		}

		constructor(el: QuarkHTMLElement)
		{
			this.#element = el;
			const tabsExplore: QuarkHTMLElement|null = this.#element.querySelector('.r-sharp-tabs__tab:nth-child(1)');
			const tabsChat: QuarkHTMLElement|null = this.#element.querySelector('.r-sharp-tabs__tab:nth-child(2)');
			const tabsNotifications: QuarkHTMLElement|null = this.#element.querySelector('.r-sharp-tabs__tab:nth-child(3)');
			const tabsUnderlay: QuarkHTMLElement|null = this.#element.querySelector('.r-sharp-tabs__underlay');
			if (tabsExplore != null && tabsChat != null && tabsNotifications != null && tabsUnderlay != null)
			{
				this.#explore = tabsExplore;
				this.#chat = tabsChat;
				this.#notifications = tabsNotifications;
				this.#underlay = tabsUnderlay;
			}
			else this.#panic();
		}
	}

	constructor(el: QuarkHTMLElement, args: any)
	{
		super(el, args);

		class TabChild
		{
			#element: QuarkHTMLElement;
			#context: MDCRipple;

			public activate(): void
			{
				this.#element.classList.add('r-sharp-tabs__current-tab');
			}

			public deactivate(): void
			{
				this.#element.classList.remove('r-sharp-tabs__current-tab');
			}

			constructor(el: QuarkHTMLElement, context: MDCRipple)
			{
				this.#element = el;
				this.#context = context;
			}
		}

		el.style.cssText += 'position: relative;';

		const tabsUnderlay: QuarkHTMLElement = <QuarkHTMLElement>(<any>document.createElement('div'));
		tabsUnderlay.classList.add('r-sharp-tabs__underlay');
		tabsUnderlay.quark = new
		(
			class
			{
				#element: QuarkHTMLElement;

				public switchTo(to: number): void
				{
					this.#element.style.cssText = this.#element.style.cssText.replace(/(?<=)left: .+;/gm, '') + `left: calc((33.3% - .25em) * ${to} + (.125em * ${to * 2}));`;	
				}

				constructor(el: QuarkHTMLElement)
				{
					this.#element = el;
				}
			}
		)(tabsUnderlay);
		el.appendChild(tabsUnderlay);

		const tabsContainer: HTMLDivElement = document.createElement('div');
		tabsContainer.classList.add('r-sharp-tabs');

		// Explore tab
		const tabsExplore: QuarkHTMLElement = <QuarkHTMLElement>(<any>document.createElement('div'));
		tabsExplore.classList.add('r-sharp-tabs__tab', 'r-sharp-tabs__current-tab');
		tabsExplore.innerHTML +=
			`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">${
			'\n\t'}<g>${
			'\n\t\t'}<path d="M14,4V3a1,1,0,0,0-1-1H3A1,1,0,0,0,2,3V13a1,1,0,0,0,1,1H4V6A2,2,0,0,1,6,4Z"></path>${
			'\n\t\t'}<path d="M16,5H6A1,1,0,0,0,5,6V16a1,1,0,0,0,1,1h4a5,5,0,0,1-1-3,5,5,0,0,1,5-5,5,5,0,0,1,3,1V6A1,1,0,0,0,16,5Z"></path>${
			'\n\t\t'}<path d="M19.21,17.79,17.43,16A4,4,0,0,0,18,14a4,4,0,1,0-4,4,4,4,0,0,0,2-.57l1.77,1.77a1,1,0,0,0,1.41-1.41ZM14,16a2,2,0,1,1,2-2A2,2,0,0,1,14,16Z"></path>${
			'\n\t'}</g>${
			'\n'}</svg>`;
		tabsExplore.onclick = (): void => el.quark.switchTo('explore');
		const tabsExploreContext: MDCRipple = new MDCRipple(tabsExplore);
		tabsExplore.quark = new TabChild(tabsExplore, tabsExploreContext);
		tabsContainer.appendChild(tabsExplore);

		// Chat tab
		const tabsChat: QuarkHTMLElement = <QuarkHTMLElement>(<any>document.createElement('div'));
		tabsChat.classList.add('r-sharp-tabs__tab');
		tabsChat.innerHTML +=
			`<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">${
			'\n\t'}<path d="M10,0A10,10,0,0,0,1.64,15.51L.57,18.73c-.16.52.19.86.7.7l3.22-1.08A10,10,0,1,0,10,0ZM5.54,11.41A1.39,1.39,0,1,1,6.93,10,1.39,1.39,0,0,1,5.54,11.41Zm4.46,0A1.39,1.39,0,1,1,11.39,10,1.39,1.39,0,0,1,10,11.41Zm4.44,0A1.39,1.39,0,1,1,15.83,10,1.39,1.39,0,0,1,14.44,11.41Z"></path>${
			'\n'}</svg>`;
		tabsChat.onclick = (): void => el.quark.switchTo('chat');
		const tabsChatContext: MDCRipple = new MDCRipple(tabsChat);
		tabsChat.quark = new TabChild(tabsChat, tabsChatContext);
		tabsContainer.appendChild(tabsChat);

		// Notifications tab
		const tabsNotifications: QuarkHTMLElement = <QuarkHTMLElement>(<any>document.createElement('div'));
		tabsNotifications.classList.add('r-sharp-tabs__tab');
		tabsNotifications.innerHTML +=
			`<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">${
			'\n\t'}<path d="M7.79,9.16,2.48,3.85A2.49,2.49,0,0,1,3.75,3.5h12.5a2.49,2.49,0,0,1,1.27.35L12.21,9.16A3.13,3.13,0,0,1,7.79,9.16Z"></path><path d="M13.09,10.31,18.4,5a2.47,2.47,0,0,1,.35,1.27v7.5a2.5,2.5,0,0,1-2.5,2.5H3.75a2.5,2.5,0,0,1-2.5-2.5V6.27A2.47,2.47,0,0,1,1.6,5l5.31,5.31a4.37,4.37,0,0,0,6.18,0Z"></path>${
			'\n'}</svg>`;
		tabsNotifications.onclick = (): void => el.quark.switchTo('notifications');
		const tabsNotificationsContext: MDCRipple = new MDCRipple(tabsNotifications);
		tabsNotifications.quark = new TabChild(tabsNotifications, tabsNotificationsContext);
		tabsContainer.appendChild(tabsNotifications);

		el.appendChild(tabsContainer);
		
		el.quark = new this.#QuarkData(el);
	}
}