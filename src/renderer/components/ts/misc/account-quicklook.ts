import * as Kuudere from 'kuudere';
import * as utils from '../../../utils';
import { componentPanicMessage } from '../../../utils/component-panic';
import { getDefaultProfilePictureUrl } from '../../../utils/get-default-pic';
import { MDCRipple } from '@material/ripple';
import { RedditMe } from '../../../../main/api/account';

/**
 * @summary Provides a component that shows details about the current user at a glance.
 */
export class AccountQuicklook extends Kuudere.Component<Promise<RedditMe>>
{
	#element: Kuudere.HTMLKuudereComponent<AccountQuicklook>;
	#children:
	{
		profilePicture: HTMLImageElement;
		keyDetails: HTMLDivElement;
		karma: HTMLSpanElement;
		coins: HTMLSpanElement;
	};
	#me?: RedditMe;

	// Getters for all of the child elements.  If the element has been removed, the component will panic.
	#get__children =
	{
		profilePicture: (): HTMLImageElement =>
		{
			if (this.#children.profilePicture != null)
				return this.#children.profilePicture;
			else
				this.#panic();
			return document.createElement('img');
		},
		keyDetails: (): HTMLDivElement =>
		{
			if (this.#children.keyDetails != null)
				return this.#children.keyDetails;
			else
				this.#panic();
			return document.createElement('div');
		},
		karma: (): HTMLSpanElement =>
		{
			if (this.#children.karma != null)
				return this.#children.karma;
			else
				this.#panic();
			return document.createElement('span');
		},
		coins: (): HTMLSpanElement =>
		{
			if (this.#children.coins != null)
				return this.#children.coins;
			else
				this.#panic();
			return document.createElement('span');
		},
	};

	#panic = (): void =>
	{
		this.#element.remove();
		console.error(componentPanicMessage('AccountQuicklook'));
	}

	/**
	 * @summary Sets the profile picture `src` attribute.
	 * @description Does not alter their actual profile picture. Used when switching accounts.
	 * @param url The URL to set the profile picture to.
	 */
	public setProfilePicture(url: string): void { this.#get__children.profilePicture().src = utils.stripImageUrl(url); }
	/**
	 * @summary Gets the `src` attribute of the profile picture.
	 * @returns {string} URL - The `src` attribute of the profile picture.
	 */
	public getProfilePicture(): string { return this.#get__children.profilePicture().src; }

	/**
	 * @summary _Visually_ modifies the users karma.
	 * @description Does not alter their actual karma. Used when switching accounts.
	 * @param {number} karma - The value to set karma to.
	 */
	public setKarma(v: number): void
	{
		this.#get__children.karma().innerHTML =
			this.#get__children.karma().innerHTML.replace(this.#get__children.karma().innerText, `${utils.prettyNumber(v)}`);
	}
	/**
	 * @summary Gets the _actual_ value of the users karma.
	 * @description ...
	 * @returns {number} karma - The value of the users karma.
	 */
	public getKarma(): number { return this.#me!.link_karma + this.#me!.comment_karma; }

	public setCoins(v: number): void
	{
		this.#get__children.coins().innerHTML =
			this.#get__children.coins().innerHTML.replace(this.#get__children.coins().innerText, `${utils.prettyNumber(v)}`);
		this.#me!.coins = v;
	}
	public getCoins(): number { try { return this.#me!.coins; } catch(err) { return 0; } }

	public setMe(v: RedditMe): void
	{
		this.#me = v;
		this.setCoins(v.coins);
		this.setProfilePicture(v.icon_img);
		this.setKarma(v.comment_karma + v.link_karma);
	}

	public getMe(): RedditMe|undefined
	{
		if (this.#me != null) return this.#me;
		else return;
	}

	constructor(el: Kuudere.HTMLKuudereComponent<AccountQuicklook>, args: Kuudere.Arguments<Promise<RedditMe>>)
	{
		super(el, args);

		this.#element = el;

		el.classList.add('r-sharp-account-quicklook', 'mdc-ripple-surface');

		MDCRipple.attachTo(el);

		new Kuudere.JsDom
		([
			{ '': 'img', $: { 'class': 'r-sharp-profile-picture', 'src': getDefaultProfilePictureUrl() } },
			{ '': 'div', $: { 'class': 'r-sharp-account-quicklook__account-details' }, '...': [
				{ '': 'div', $: { 'class': 'r-sharp-account-quicklook__key-details' }, '...': [
					'u/foobarbaz'
				] },
				{ '': 'div', $: { 'class': 'r-sharp-account-quicklook__lesser-details' }, '...': [
					{ '': 'span', $: { 'class': 'r-sharp-account-quicklook__karma' }, '...': [
						`<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M3.37,2.75a5.9,5.9,0,0,1,5.49,3.7.62.62,0,0,1-.29.79A3.16,3.16,0,0,0,7.24,8.57a.63.63,0,0,1-.79.29,5.89,5.89,0,0,1-3.7-5.49A.62.62,0,0,1,3.37,2.75Zm8.06,4.49a.63.63,0,0,1-.29-.79,5.89,5.89,0,0,1,5.49-3.7.61.61,0,0,1,.62.6v0a5.89,5.89,0,0,1-3.7,5.49.62.62,0,0,1-.79-.29A3.16,3.16,0,0,0,11.43,7.24Zm2.12,3.9a5.89,5.89,0,0,1,3.7,5.49.62.62,0,0,1-.62.62h0a5.89,5.89,0,0,1-5.49-3.7.63.63,0,0,1,.29-.79,3.16,3.16,0,0,0,1.33-1.33A.62.62,0,0,1,13.55,11.14Zm-5,1.62a.62.62,0,0,1,.29.79,5.89,5.89,0,0,1-5.49,3.7.62.62,0,0,1-.62-.62h0a5.9,5.9,0,0,1,3.7-5.49.62.62,0,0,1,.79.29,3.1,3.1,0,0,0,1.35,1.33ZM10,5.93A7.23,7.23,0,0,0,7.51,2.82,5,5,0,0,1,9.68.09a.61.61,0,0,1,.64,0,5,5,0,0,1,2.17,2.73A7.23,7.23,0,0,0,10,5.93Zm9.91,3.75a.61.61,0,0,1,0,.64,5,5,0,0,1-2.73,2.17A7.23,7.23,0,0,0,14.07,10a7.36,7.36,0,0,0,3.11-2.49A5,5,0,0,1,19.91,9.68ZM10,14.07a7.18,7.18,0,0,0,2.5,3.11,5,5,0,0,1-2.18,2.73.61.61,0,0,1-.64,0,5,5,0,0,1-2.17-2.73A7.23,7.23,0,0,0,10,14.07ZM5.93,10a7.23,7.23,0,0,0-3.11,2.49A5,5,0,0,1,.09,10.32a.61.61,0,0,1,0-.64A5,5,0,0,1,2.82,7.51,7.23,7.23,0,0,0,5.93,10Z"></path></svg>`,
						'4200',
					] },
					{ '': 'span', $: { 'class': 'r-sharp-account-quicklook__coins' }, '...': [
						{ '': 'i', $: { 'class': 'r-sharp-icons__reddit-coin' } },
						'42',
					] }
				] }
			] }
		]).appendTo(el);

		const profilePictureEl: HTMLImageElement = <HTMLImageElement>el.querySelector('.r-sharp-profile-picture')!;
		const keyDetailsEl: HTMLDivElement = <HTMLDivElement>el.querySelector('.r-sharp-account-quicklook__key-details')!;
		const karmaEl: HTMLSpanElement = <HTMLSpanElement>el.querySelector('.r-sharp-account-quicklook__karma')!;
		const coinsEl: HTMLSpanElement = <HTMLSpanElement>el.querySelector('.r-sharp-account-quicklook__coins')!;

		this.#children =
		{
			profilePicture: profilePictureEl,
			keyDetails: keyDetailsEl,
			karma: karmaEl,
			coins: coinsEl,
		};

		args.constructor.then((me: RedditMe): void =>
		{
			this.#get__children.profilePicture().src = utils.stripImageUrl(me.icon_img);
			this.#get__children.profilePicture().setAttribute('loaded', '');

			this.#get__children.keyDetails().innerHTML = `${me.subreddit.display_name_prefixed}<i class="r-sharp-icons__reddit-premium"></i>`;
			this.#get__children.keyDetails().setAttribute('loaded', '');
			
			this.#get__children.karma().innerHTML = this.#get__children.karma().innerHTML.replace(/4200/gm, utils.prettyNumber(me.link_karma + me.comment_karma));
			this.#get__children.karma().setAttribute('loaded', '');

			this.#get__children.coins().innerHTML = this.#get__children.coins().innerHTML.replace(/42/gm, utils.prettyNumber(me.coins));
			this.#get__children.coins().setAttribute('loaded', '');

			this.#me = me;
		});
	}
}
