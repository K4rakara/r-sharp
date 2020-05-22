import quark from '@quark.js/core';
import { fetchImageUrl } from '../api/image-fetch';

interface ProfilePictureConstructor { src: string; }

interface ProfilePictureArguments
{
	tag?: string;
	component: string;
	constructor: ProfilePictureConstructor;
	element: any;
}

export class ProfilePicture extends quark.Component
{
	constructor(el: HTMLElement, args: ProfilePictureArguments)
	{
		super(el, args);

		const profilePicture: HTMLDivElement = document.createElement('div');
		profilePicture.classList.add('r-sharp-profile-picture');
		(async (): Promise<void> =>
		{
			profilePicture.style.cssText += `background-image: url('${await fetchImageUrl(args.constructor.src)}');`;
		})();
		el.append(profilePicture);
	}
}