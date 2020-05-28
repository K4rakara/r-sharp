import quark from '@quark.js/core';
import { RedditMe } from '../../../main/api/account';
import { karmaSvgIcon } from '../../../consts';
import * as utils from '../../utils';
import { QuarkHTMLElement } from '../../quark-element';
import { componentPanicMessage } from '../../utils/component-panic';

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
	#QuarkData = class
	{
		#element: QuarkHTMLElement;
		#profilePicture?: QuarkHTMLElement;
		#keyDetails?: HTMLDivElement;
		#karma?: HTMLSpanElement;
		#coins?: HTMLSpanElement;
		#me?: RedditMe;

		get profilePicture(): QuarkHTMLElement
		{
			if (this.#profilePicture != null)
				return this.#profilePicture;
			else
				this.#panic();
			return <QuarkHTMLElement>(<any>document.createElement('div'));
		}

		get keyDetails(): HTMLDivElement
		{
			if (this.#keyDetails != null)
				return this.#keyDetails;
			else
				this.#panic();
			return document.createElement('div');
		}

		get karmaElement(): HTMLSpanElement
		{
			if (this.#karma != null)
				return this.#karma;
			else
				this.#panic();
			return document.createElement('span');
		}

		get coins(): HTMLSpanElement
		{
			if (this.#coins != null)
				return this.#coins;
			else
				this.#panic();
			return document.createElement('span');
		}

		public gotMe(me: RedditMe)
		{
			this.#me = me;

			const profilePictureElement: HTMLImageElement|null = this.profilePicture.querySelector('img');
			if (profilePictureElement != null) profilePictureElement.src = utils.stripImageUrl(me.subreddit.icon_img);
			
			this.keyDetails.innerHTML += `${this.#me.subreddit.display_name_prefixed}`;
			if (this.#me.is_gold)
				this.keyDetails.innerHTML += `<i class="r-sharp-icons__reddit-premium"></i>`;
		
			this.karmaElement.innerHTML += utils.prettyNumber(this.#me.comment_karma + this.#me.link_karma);

			this.coins.innerHTML += utils.prettyNumber(this.#me.coins);
		}

		#panic = (): void =>
		{
			this.#element.remove();
			console.log(componentPanicMessage('AccountQuicklook'));
		}

		constructor(el: QuarkHTMLElement)
		{
			this.#element = el;
			const accountQuicklookProfilePicture: QuarkHTMLElement|null = this.#element.querySelector('.r-sharp-account-quicklook__profile-picture');
			const accountQuicklookKeyDetails: HTMLDivElement|null = this.#element.querySelector('.r-sharp-account-quicklook__key-details');
			const accountQuicklookKarma: HTMLSpanElement|null = this.#element.querySelector('.r-sharp-account-quicklook__karma');
			const accountQuicklookCoins: HTMLSpanElement|null = this.#element.querySelector('.r-sharp-account-quicklook__coins');
			if (accountQuicklookProfilePicture != null && accountQuicklookKeyDetails != null
				&& accountQuicklookKarma != null && accountQuicklookCoins != null)
			{
				this.#profilePicture = accountQuicklookProfilePicture;
				this.#keyDetails = accountQuicklookKeyDetails;
				this.#karma = accountQuicklookKarma;
				this.#coins = accountQuicklookCoins;
			}
			else this.#panic();
		}
	}


	constructor(el: QuarkHTMLElement, args: AccountQuicklookArguments)
	{
		super(el, args);

		const accountQuicklookContainer: HTMLDivElement = document.createElement('div');
		accountQuicklookContainer.classList.add('r-sharp-account-quicklook');
		
		let accountQuicklookProfilePicture: HTMLDivElement = document.createElement('div');
		accountQuicklookProfilePicture.classList.add('r-sharp-account-quicklook__profile-picture');
		accountQuicklookProfilePicture = <HTMLDivElement>quark.replace
		(
			accountQuicklookProfilePicture,
			{
				component: 'profile-picture',
				constructor: {},
				element: {}
			}
		) || <HTMLDivElement>accountQuicklookProfilePicture;
		accountQuicklookContainer.appendChild(accountQuicklookProfilePicture);

		accountQuicklookContainer.innerHTML +=
			`<div class="r-sharp-account-quicklook__account-details">${
			'\n\t'}<div class="r-sharp-account-quicklook__key-details">${
			'\n\t'}</div>${
			'\n\t'}<div class="r-sharp-account-quicklook__lesser-details">${	
			'\n\t\t'}<span class="r-sharp-account-quicklook__karma">${
			'\n\t\t\t'}${karmaSvgIcon}${
			'\n\t\t'}</span>${
			'\n\t\t'}<span class="r-sharp-account-quicklook__coins">${
			'\n\t\t\t'}<i class="r-sharp-icons__reddit-coin"></i>${
			'\n\t\t'}</span>${
			'\n\t'}</div>${
			'\n'}</div>`;

		el.appendChild(accountQuicklookContainer);

		el.quark = new this.#QuarkData(el);

		args.constructor.me.then((me: RedditMe): void =>
		{
			el.quark.gotMe(me);
		});
	}
}