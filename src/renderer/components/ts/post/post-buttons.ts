import quark from '@quark.js/core';
import { PostArguments } from './post';
import { QuarkHTMLElement } from '../../../quark-element';
import { RedditLink } from '../../../../main/api/reddit-types';

export class PostButtons extends quark.Component
{
	#QuarkData = class
	{


		public toggleSave(): void
		{

		}
	}

	constructor(el: QuarkHTMLElement, args: PostArguments)
	{
		super(el, args);
	}
}
