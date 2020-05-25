import quark from '@quark.js/core';
import { Card } from './card';

interface PostConstructor
{
	score: number;
	upvoted: boolean;

}

interface PostArguments
{
	tag?: string;
	constructor: PostConstructor;
	component: 'post';
	element: any;

}

export class Post extends quark.Component
{
	
	#QuarkData = class
	{
	}

	constructor(el: HTMLElement, args: PostArguments)
	{
		super(el, args);

		quark.append
		(
			el,
			{
				tag: 'div',
				component: 'card',
				constructor:
				{
					fields:
					[
						{
							type: 'component',
							display: 'inline',
							direction: 'row',
							width: 20,
							height: 100,
							component: 'voting',
							constructor: {},
							element: {}
						}
					]
				},
				element: {}
			}
		);
	}

}