import quark from '@quark.js/core';
import { QuarkHTMLElement } from '../../../quark-element';
import { JSONDom } from '../../../utils/json-dom';
import { RedditMe } from '../../../../main/api/account';
import * as utils from '../../../utils';
import { MDCRipple } from '@material/ripple';

interface AccountDetailsConstructor
{
	me: RedditMe;
}

interface AccountDetailsArguments
{
	tag?: string;
	component: string;
	constructor: AccountDetailsConstructor;
	element: any;
}

export class AccountDetails extends quark.Component
{
	#element: QuarkHTMLElement;
	#children:
	{
		
	};

	public open(): void
	{
		this.#element.setAttribute('visible', '');
		window.setTimeout((): void =>
		{
			this.#element.setAttribute('opened', '');
		}, 100);
	}

	public close(): void
	{
		this.#element.removeAttribute('opened');
		setTimeout((): void =>
		{
			this.#element.removeAttribute('visible');
		}, 500);
	}

	constructor(el: QuarkHTMLElement, args: AccountDetailsArguments)
	{
		super(el, args);
	
		// Set all the private values
		this.#element = el;
		//@ts-ignore
		this.#children = {};

		el.classList.add('r-sharp-account-details');

		new JSONDom
		([
			{ _: 'div', $: { 'class': 'r-sharp-scrim r-sharp-account-details__scrim' }, onclick: (e: MouseEvent): void =>
			{
				this.close();	
			} },
			{ _: 'div', $: { 'class': 'r-sharp-account-details__main' }, '': [
				{ _: 'div', $: { 'class': 'r-sharp-account-details__top' }, '': [
					{ _: 'div', $: { 'class': 'r-sharp-account-details__key-details' }, '': [
						{ _: 'img', $: {
							'class': 'r-sharp-account-details__key-details__profile-picture',
							'src': utils.stripImageUrl(args.constructor.me.icon_img),
							'draggable': 'false',
						} },
						{ _: 'div', $: { 'class': 'r-sharp-account-details__key-details__user-name mdc-ripple-surface' }, '': [
							args.constructor.me.subreddit.display_name_prefixed,
							(args.constructor.me.is_gold)
								? { _: 'i', $: { 'class': 'r-sharp-icons__reddit-premium' } }
								: '',
							{ _: 'div', $: { 'class': 'r-sharp-account-details__key-details__switch-user' }, '': [
								{ _: 'i', $: { 'class': 'r-sharp-icons__dropdown' } }
							] }
						] }
					] },
					{ _: 'div', $: { 'class': 'r-sharp-account-details__lesser-details' }, '': [
						{ _: 'div', $: { 'class': 'r-sharp-account-details__lesser-details__karma' }, '': [
							'<svg class="r-sharp-account-details__lesser-details__karma-icon" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M3.37,2.75a5.9,5.9,0,0,1,5.49,3.7.62.62,0,0,1-.29.79A3.16,3.16,0,0,0,7.24,8.57a.63.63,0,0,1-.79.29,5.89,5.89,0,0,1-3.7-5.49A.62.62,0,0,1,3.37,2.75Zm8.06,4.49a.63.63,0,0,1-.29-.79,5.89,5.89,0,0,1,5.49-3.7.61.61,0,0,1,.62.6v0a5.89,5.89,0,0,1-3.7,5.49.62.62,0,0,1-.79-.29A3.16,3.16,0,0,0,11.43,7.24Zm2.12,3.9a5.89,5.89,0,0,1,3.7,5.49.62.62,0,0,1-.62.62h0a5.89,5.89,0,0,1-5.49-3.7.63.63,0,0,1,.29-.79,3.16,3.16,0,0,0,1.33-1.33A.62.62,0,0,1,13.55,11.14Zm-5,1.62a.62.62,0,0,1,.29.79,5.89,5.89,0,0,1-5.49,3.7.62.62,0,0,1-.62-.62h0a5.9,5.9,0,0,1,3.7-5.49.62.62,0,0,1,.79.29,3.1,3.1,0,0,0,1.35,1.33ZM10,5.93A7.23,7.23,0,0,0,7.51,2.82,5,5,0,0,1,9.68.09a.61.61,0,0,1,.64,0,5,5,0,0,1,2.17,2.73A7.23,7.23,0,0,0,10,5.93Zm9.91,3.75a.61.61,0,0,1,0,.64,5,5,0,0,1-2.73,2.17A7.23,7.23,0,0,0,14.07,10a7.36,7.36,0,0,0,3.11-2.49A5,5,0,0,1,19.91,9.68ZM10,14.07a7.18,7.18,0,0,0,2.5,3.11,5,5,0,0,1-2.18,2.73.61.61,0,0,1-.64,0,5,5,0,0,1-2.17-2.73A7.23,7.23,0,0,0,10,14.07ZM5.93,10a7.23,7.23,0,0,0-3.11,2.49A5,5,0,0,1,.09,10.32a.61.61,0,0,1,0-.64A5,5,0,0,1,2.82,7.51,7.23,7.23,0,0,0,5.93,10Z"></path></svg>',
							{ _: 'div', $: { 'class': 'r-sharp-account-details__lesser-details__karma-details' }, '': [
								{ _: 'div', $: { 'class': 'r-sharp-account-details__lesser-details__karma-amount' }, '': [
									`${args.constructor.me.link_karma + args.constructor.me.comment_karma}`
								] },
								{ _: 'div', $: { 'class': 'r-sharp-account-details__lesser-details__karma-label' }, '': [
									'Karma'
								] },
								quark.replace
								(
									document.createElement('div'),
									{
										component: 'tooltip',
										constructor: { text: `${utils.prettyNumber(args.constructor.me.link_karma)} Post<br>${utils.prettyNumber(args.constructor.me.comment_karma)} Comment` },
										element: {}
									}
								)!
							] },
						] },
						{ _: 'div', $: { 'class': 'r-sharp-account-details__lesser-details__reddit-age' }, '': [
							'<svg class="r-sharp-account-details__lesser-details__reddit-age-icon" viewBox="0 0 40 40" version="1.1" xmlns="http://www.w3.org/2000/svg"><g><g><path d="M37.5,22.5V20h-35v15c0,1.4,1.1,2.5,2.5,2.5h30c1.4,0,2.5-1.1,2.5-2.5v0H6.2C5.6,35,5,34.5,5,33.8l0,0c0-0.7,0.6-1.2,1.2-1.2h31.3V30H6.2C5.6,30,5,29.5,5,28.8v0c0-0.7,0.6-1.2,1.2-1.2h31.3V25H6.2C5.6,25,5,24.5,5,23.8v0c0-0.7,0.6-1.2,1.2-1.2H37.5z"></path><path d="M22.5,6c0,1.4-1.1,2.5-2.5,2.5S17.5,7.4,17.5,6S20,0,20,0S22.5,4.6,22.5,6z"></path><path d="M20,15L20,15c-0.7,0-1.3-0.6-1.3-1.2v-2.5c0-0.7,0.6-1.2,1.2-1.2h0c0.7,0,1.2,0.6,1.2,1.2v2.5C21.2,14.5,20.7,15,20,15z"></path><path d="M22.8,11.3v2.3c0,1.4-1,2.7-2.5,2.9c-1.6,0.2-3-1.1-3-2.7v-5c0,0,0-0.1,0-0.1l-0.8-0.4c-0.9-0.4-2-0.3-2.7,0.4L2.5,18.5h35L22.8,11.3z"></path></g></g></svg>',
							{ _: 'div', $: { 'class': 'r-sharp-account-details__lesser-details__reddit-age-details' }, '': [
								{ _: 'div', $: { 'class': 'r-sharp-account-details__lesser-details__reddit-age-amount' }, '': [
									`${utils.prettyTimestampRoughRelativeShort(new Date(args.constructor.me.created * 1000))}`
								] },
								{ _: 'div', $: { 'class': 'r-sharp-account-details__lesser-details__reddit-age-label' }, '': [
									'Reddit age'
								] },
								quark.replace
								(
									document.createElement('div'),
									{
										component: 'tooltip',
										constructor: { text: `Joined on ${utils.prettyTimestampExactStatic(new Date(args.constructor.me.created * 1000))}` },
										element: {}
									}
								)!
							] }
						] }
					] }
				] },
				{ _: 'div', $: { 'class': 'r-sharp-account-details__bottom' }, '': [
					{ _: 'div', $: { 'class': 'r-sharp-account-details__buttons' }, '': [
						{ _: 'div', $: { 'class': 'r-sharp-account-details__buttons__my-profile r-sharp-account-details__buttons__button mdc-ripple-surface' }, '': [
							'<svg class="r-sharp-account-details__buttons__my-profile-icon r-sharp-account-details__buttons__button-icon" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><g fill="inherit"><path d="M15,15.5 L5,15.5 C4.724,15.5 4.5,15.276 4.5,15 C4.5,12.755 6.326,10.929 8.571,10.929 L11.429,10.929 C13.674,10.929 15.5,12.755 15.5,15 C15.5,15.276 15.276,15.5 15,15.5 M10,4.5 C11.405,4.5 12.547,5.643 12.547,7.048 C12.547,8.452 11.405,9.595 10,9.595 C8.595,9.595 7.453,8.452 7.453,7.048 C7.453,5.643 8.595,4.5 10,4.5 M16,2 L4,2 C2.897,2 2,2.897 2,4 L2,16 C2,17.103 2.897,18 4,18 L16,18 C17.103,18 18,17.103 18,16 L18,4 C18,2.897 17.103,2 16,2"></path></g></svg>',
							'My profile'
						] },
						{ _: 'div', $: { 'class': 'r-sharp-account-details__buttons__reddit-coins r-sharp-account-details__buttons__button mdc-ripple-surface' }, '': [
							'<svg class="r-sharp-account-details__buttons__reddit-coins-icon r-sharp-account-details__buttons__button-icon" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10,1.5 C14.687,1.5 18.5,5.313 18.5,10 C18.5,14.687 14.687,18.5 10,18.5 C5.314,18.5 1.5,14.687 1.5,10 C1.5,5.313 5.314,1.5 10,1.5 Z M7.879,12.122 C6.709,10.952 6.709,9.049 7.879,7.879 C9.012,6.746 10.988,6.746 12.121,7.879 C12.512,8.269 13.145,8.269 13.535,7.879 C13.926,7.489 13.926,6.855 13.535,6.465 C12.591,5.52 11.336,5 10,5 C8.664,5 7.409,5.52 6.465,6.465 C4.516,8.414 4.516,11.586 6.465,13.536 C7.409,14.48 8.664,15 10,15 C11.336,15 12.591,14.48 13.535,13.536 C13.926,13.145 13.926,12.512 13.535,12.122 C13.145,11.731 12.512,11.731 12.121,12.122 C10.988,13.255 9.012,13.255 7.879,12.122 Z"></path></svg>',
							'Reddit Coins'
						] },
						{ _: 'div', $: { 'class': 'r-sharp-account-details__buttons__reddit-premium r-sharp-account-details__buttons__button mdc-ripple-surface' }, '': [
							'<svg class="r-sharp-account-details__buttons__reddit-premium-icon r-sharp-account-details__buttons__button-icon" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M13.535 15.785c-1.678.244-2.883.742-3.535 1.071v-5.113a2 2 0 0 0-2-2H4.217c.044-.487.076-1.016.076-1.629 0-1.692-.489-2.968-.884-3.722L4.8 3.001H10v4.742a2 2 0 0 0 2 2h3.783c.06.67.144 1.248.22 1.742.097.632.182 1.177.182 1.745 0 1.045-.829 2.291-2.65 2.555m5.028-12.249l-2.242-2.242a1 1 0 0 0-.707-.293H4.386a1 1 0 0 0-.707.293L1.436 3.536a1 1 0 0 0-.069 1.337c.009.011.926 1.2.926 3.241 0 1.304-.145 2.24-.273 3.065-.106.684-.206 1.33-.206 2.051 0 1.939 1.499 4.119 4.364 4.534 2.086.304 3.254 1.062 3.261 1.065a1.016 1.016 0 0 0 1.117.004c.011-.007 1.18-.765 3.266-1.069 2.864-.415 4.363-2.595 4.363-4.534 0-.721-.099-1.367-.206-2.051-.128-.825-.272-1.761-.272-3.065 0-2.033.893-3.199.926-3.241a.999.999 0 0 0-.07-1.337"></path></svg>',
							'Reddit Premium'
						] },
						{ _: 'div', $: { 'class': 'r-sharp-account-details__buttons__saved r-sharp-account-details__buttons__button mdc-ripple-surface' }, '': [
							'<svg class="r-sharp-account-details__buttons__saved-icon r-sharp-account-details__buttons__button-icon" viewBox="0 0 24 24"><path d="M4,6H2V20A2,2 0 0,0 4,22H18V20H4V6M20,2H8A2,2 0 0,0 6,4V16A2,2 0 0,0 8,18H20A2,2 0 0,0 22,16V4A2,2 0 0,0 20,2M20,12L17.5,10.5L15,12V4H20V12Z"/></svg>',
							'Saved'
						] },
						{ _: 'div', $: { 'class': 'r-sharp-account-details__buttons__history r-sharp-account-details__buttons__button mdc-ripple-surface' }, '': [
							'<svg class="r-sharp-account-details__buttons__history-icon r-sharp-account-details__buttons__button-icon" viewBox="0 0 24 24"><path d="M13.5,8H12V13L16.28,15.54L17,14.33L13.5,12.25V8M13,3A9,9 0 0,0 4,12H1L4.96,16.03L9,12H6A7,7 0 0,1 13,5A7,7 0 0,1 20,12A7,7 0 0,1 13,19C11.07,19 9.32,18.21 8.06,16.94L6.64,18.36C8.27,20 10.5,21 13,21A9,9 0 0,0 22,12A9,9 0 0,0 13,3"/></svg>',
							'History'
						] }
					] },
					{ _: 'div', $: { 'class': 'r-sharp-account-details__settings' }, '': [
						{ _: 'div', $: { 'class': 'r-sharp-account-details__settings__reddit-settings r-sharp-account-details__buttons__button mdc-ripple-surface' }, '': [
							'<svg class="r-sharp-account-details__buttons__button-icon" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><g fill="inherit"><path d="M7.03093403,10 C7.03093403,8.36301971 8.36301971,7.03093403 10,7.03093403 C11.6369803,7.03093403 12.9679409,8.36301971 12.9679409,10 C12.9679409,11.6369803 11.6369803,12.969066 10,12.969066 C8.36301971,12.969066 7.03093403,11.6369803 7.03093403,10 M16.4016617,8.49127796 C16.2362761,7.79148295 15.9606334,7.13669084 15.5916096,6.5437777 L16.5231696,5.06768276 C16.7526843,4.70315931 16.7684353,4.22387849 16.5231696,3.83572852 C16.1833977,3.29794393 15.4712269,3.13593351 14.9323172,3.47683044 L13.4562223,4.40839036 C12.8633092,4.03936662 12.208517,3.76259882 11.508722,3.59833825 L11.1250724,1.89947899 C11.0294412,1.47982699 10.7020452,1.12992949 10.2542664,1.02867298 C9.63322641,0.888038932 9.01556168,1.27843904 8.87492764,1.89947899 L8.49127796,3.59833825 C7.79148295,3.76259882 7.13669084,4.03936662 6.54265263,4.40726528 L5.06768276,3.47683044 C4.70315931,3.24731568 4.22387849,3.23156466 3.83572852,3.47683044 C3.29794393,3.81660229 3.13593351,4.5287731 3.47683044,5.06768276 L4.40726528,6.54265263 C4.03936662,7.13669084 3.76259882,7.79148295 3.59721318,8.49127796 L1.89947899,8.87492764 C1.47982699,8.97055879 1.12992949,9.29795485 1.02867298,9.74573365 C0.888038932,10.3667736 1.27843904,10.9844383 1.89947899,11.1250724 L3.59721318,11.508722 C3.76259882,12.208517 4.03936662,12.8633092 4.40726528,13.4573474 L3.47683044,14.9323172 C3.24731568,15.2968407 3.23156466,15.7761215 3.47683044,16.1642715 C3.81660229,16.7020561 4.5287731,16.8640665 5.06768276,16.5231696 L6.54265263,15.5927347 C7.13669084,15.9606334 7.79148295,16.2374012 8.49127796,16.4016617 L8.87492764,18.100521 C8.97055879,18.520173 9.29795485,18.8700705 9.74573365,18.971327 C10.3667736,19.1119611 10.9844383,18.721561 11.1250724,18.100521 L11.508722,16.4016617 C12.208517,16.2374012 12.8633092,15.9606334 13.4562223,15.5916096 L14.9323172,16.5231696 C15.2968407,16.7526843 15.7749964,16.7684353 16.1631464,16.5231696 C16.7020561,16.1833977 16.8629414,15.4712269 16.5231696,14.9323172 L15.5916096,13.4562223 C15.9606334,12.8633092 16.2362761,12.208517 16.4016617,11.508722 L18.100521,11.1250724 C18.520173,11.0294412 18.8700705,10.7020452 18.971327,10.2542664 C19.1119611,9.63322641 18.721561,9.01556168 18.100521,8.87492764 L16.4016617,8.49127796 Z"></path></g></svg>',
							'Reddit settings'
						] },
						{ _: 'div', $: { 'class': 'r-sharp-account-details__settings__r-sharp-settings r-sharp-account-details__buttons__button mdc-ripple-surface' }, '': [
							'<svg class="r-sharp-account-details__buttons__button-icon" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><g fill="inherit"><path d="M7.03093403,10 C7.03093403,8.36301971 8.36301971,7.03093403 10,7.03093403 C11.6369803,7.03093403 12.9679409,8.36301971 12.9679409,10 C12.9679409,11.6369803 11.6369803,12.969066 10,12.969066 C8.36301971,12.969066 7.03093403,11.6369803 7.03093403,10 M16.4016617,8.49127796 C16.2362761,7.79148295 15.9606334,7.13669084 15.5916096,6.5437777 L16.5231696,5.06768276 C16.7526843,4.70315931 16.7684353,4.22387849 16.5231696,3.83572852 C16.1833977,3.29794393 15.4712269,3.13593351 14.9323172,3.47683044 L13.4562223,4.40839036 C12.8633092,4.03936662 12.208517,3.76259882 11.508722,3.59833825 L11.1250724,1.89947899 C11.0294412,1.47982699 10.7020452,1.12992949 10.2542664,1.02867298 C9.63322641,0.888038932 9.01556168,1.27843904 8.87492764,1.89947899 L8.49127796,3.59833825 C7.79148295,3.76259882 7.13669084,4.03936662 6.54265263,4.40726528 L5.06768276,3.47683044 C4.70315931,3.24731568 4.22387849,3.23156466 3.83572852,3.47683044 C3.29794393,3.81660229 3.13593351,4.5287731 3.47683044,5.06768276 L4.40726528,6.54265263 C4.03936662,7.13669084 3.76259882,7.79148295 3.59721318,8.49127796 L1.89947899,8.87492764 C1.47982699,8.97055879 1.12992949,9.29795485 1.02867298,9.74573365 C0.888038932,10.3667736 1.27843904,10.9844383 1.89947899,11.1250724 L3.59721318,11.508722 C3.76259882,12.208517 4.03936662,12.8633092 4.40726528,13.4573474 L3.47683044,14.9323172 C3.24731568,15.2968407 3.23156466,15.7761215 3.47683044,16.1642715 C3.81660229,16.7020561 4.5287731,16.8640665 5.06768276,16.5231696 L6.54265263,15.5927347 C7.13669084,15.9606334 7.79148295,16.2374012 8.49127796,16.4016617 L8.87492764,18.100521 C8.97055879,18.520173 9.29795485,18.8700705 9.74573365,18.971327 C10.3667736,19.1119611 10.9844383,18.721561 11.1250724,18.100521 L11.508722,16.4016617 C12.208517,16.2374012 12.8633092,15.9606334 13.4562223,15.5916096 L14.9323172,16.5231696 C15.2968407,16.7526843 15.7749964,16.7684353 16.1631464,16.5231696 C16.7020561,16.1833977 16.8629414,15.4712269 16.5231696,14.9323172 L15.5916096,13.4562223 C15.9606334,12.8633092 16.2362761,12.208517 16.4016617,11.508722 L18.100521,11.1250724 C18.520173,11.0294412 18.8700705,10.7020452 18.971327,10.2542664 C19.1119611,9.63322641 18.721561,9.01556168 18.100521,8.87492764 L16.4016617,8.49127796 Z"></path></g></svg>',
							'R# settings'
						] }
					] }
				] }
			] }
		]).appendTo(el);

		el.querySelectorAll('.mdc-ripple-surface').forEach((el: Element): void =>
		{
			MDCRipple.attachTo(el);
		});

		el.quark = this;
	}
}