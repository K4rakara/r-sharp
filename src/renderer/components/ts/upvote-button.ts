import quark from '@quark.js/core';

export class UpvoteButton extends quark.Component
{

	#QuarkData = class
	{
		#element: HTMLElement;
		#status: boolean;
		#parentPost: any;

		public upvote(): void
		{
			//@ts-ignore
			this.#element.firstElementChild.quark.vote();
			this.#status = !this.#status;
		}

		constructor(el: HTMLElement)
		{
			this.#element = el;
			this.#status = false;
		}
	}

	constructor(el: HTMLElement, args: any)
	{
		super(el, args);

		quark.append
		(
			el,
			{
				tag: 'div',
				component: 'vote-button',
				constructor:
				{
					color: '#ff4500',
					flip: false,
				},
				element: {}
			}
		);

		el.onclick = (): void =>
		{
			//@ts-ignore
			el.quark.upvote();
		};

		//@ts-ignore
		el.quark = new this.#QuarkData(el);
	}

}