import quark from '@quark.js/core';

export class DownvoteButton extends quark.Component
{

	#QuarkData = class
	{
		#element: HTMLElement;
		#status: boolean;
		#parentPost: any;

		public downvote(): void
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
					color: '#7193ff',
					flip: true,
				},
				element: {}
			}
		);

		el.onclick = (): void =>
		{
			//@ts-ignore
			el.quark.downvote();
		};

		//@ts-ignore
		el.quark = new this.#QuarkData(el);
	}

}