import quark from '@quark.js/core';
import { stripImageUrl } from '../../api/image-fetch';
import { QuarkHTMLElement } from '../../quark-element';
import { componentPanicMessage } from '../../utils/component-panic';
import { getDefaultProfilePictureUrl } from '../../utils/get-default-pic';

interface ProfilePictureConstructor { src?: string; }

interface ProfilePictureArguments
{
	tag?: string;
	component: string;
	constructor: ProfilePictureConstructor;
	element: any;
}

export class ProfilePicture extends quark.Component
{
	#QuarkData = class
	{
		#element: QuarkHTMLElement;
		#src: string;

		get src(): string { return this.#src; }
		set src(v: string)
		{
			const profilePictureImg: HTMLImageElement|null = this.#element.querySelector('.r-sharp-profile-picture img');
			if (profilePictureImg != null)
			{
				profilePictureImg.src = v;
				this.#src = v;
			} else this.#panic();
		}

		#panic = (): void =>
		{
			this.#element.remove();
			console.log(componentPanicMessage('ProfilePicture'));
		}

		constructor(el: QuarkHTMLElement, src: string)
		{
			this.#element = el;
			this.#src = src;
		}
	}

	constructor(el: QuarkHTMLElement, args: ProfilePictureArguments)
	{
		super(el, args);

		const profilePicture: HTMLDivElement = document.createElement('div');
		profilePicture.classList.add('r-sharp-profile-picture');
		profilePicture.innerHTML += `<img src="${stripImageUrl(args.constructor.src || getDefaultProfilePictureUrl())}"/>`;
		el.append(profilePicture);
	}
}