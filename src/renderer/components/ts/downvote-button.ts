import quark from '@quark.js/core';
import { QuarkHTMLElement } from '../../quark-element';
import { MDCRipple } from '@material/ripple';
import dynamics from 'dynamics.js';
import { RedditLink } from '../../../main/api/reddit-types';

interface DownvoteButtonConstructor
{
	post: QuarkHTMLElement;
	link: RedditLink;
}

interface DownvoteButtonArguments
{
	tag?: string;
	component: string;
	constructor: DownvoteButtonConstructor;
	element: any;
}

export class DownvoteButton extends quark.Component
{

	#QuarkData = class
	{
		#element: HTMLElement;
		#post: QuarkHTMLElement;
		#context: MDCRipple;
		#canAnimate: boolean = true;

		public downvote(): void
		{
			if (!this.#post.quark.downvoted) this.#post.quark.downvote();
			else this.#post.quark.undownvote();
			this.animate();
		}

		public animate(): void
		{
			const downvoteButtonIcon: HTMLElement|null = this.#element.querySelector('.r-sharp-icons__downvote');
			const downvoteButtonRipple: HTMLElement|null = this.#element.querySelector('.r-sharp-downvote-button__ripple');
			if (downvoteButtonIcon != null && downvoteButtonRipple != null)
			{
				if (this.#post.quark.downvoted)
					downvoteButtonIcon.classList.add('downvoted');
				else
					downvoteButtonIcon.classList.remove('downvoted');
				if (this.#canAnimate)
				{
					this.canAnimate = false;
					dynamics.animate
					(
						downvoteButtonIcon,
						{
							translateY: 16,
						},
						{
							type: dynamics.bounce,
							duration: 300,
							frequency: 100,
							friction: 75,
							complete: (): void => { this.canAnimate = true; }
						}
					);
				}
				this.#context.activate();
				setTimeout((): void => this.deripple(), 4);
			}
			else this.#panic();
		}

		public update(): void
		{
			const downvoteButtonIcon: HTMLElement|null = this.#element.querySelector('.r-sharp-icons__downvote');
			if (downvoteButtonIcon != null)
			{
				if (this.#post.quark.downvoted)
					downvoteButtonIcon.classList.add('downvoted');
				else
					downvoteButtonIcon.classList.remove('downvoted');
			}
		}

		public deripple(): void
		{
			this.#context.deactivate();
		}

		get canAnimate(): boolean { return this.#canAnimate; }
		set canAnimate(v: boolean) { this.#canAnimate = v; }
		
		#panic = (): void =>
		{
			this.#element.remove();
			console.log(`An Downvote element lacked one or more critical elements for it to function, and will now be removed.`);
		}

		constructor(el: HTMLElement, post: QuarkHTMLElement, context: MDCRipple, likes?: boolean)
		{
			this.#element = el;
			this.#post = post;
			this.#context = context;
			const downvoteButtonIcon: HTMLElement|null = this.#element.querySelector('.r-sharp-icons__downvote');
			if (downvoteButtonIcon != null)
				if (likes != null && !likes) downvoteButtonIcon.classList.add('downvoted');
				else null;
			else this.#panic();
		}
	}

	constructor(el: QuarkHTMLElement, args: DownvoteButtonArguments)
	{
		super(el, args);

		const downvoteButtonContainer: HTMLDivElement = document.createElement('div');
		downvoteButtonContainer.classList.add('r-sharp-downvote-button');
		
		const downvoteButtonRipple: HTMLDivElement = document.createElement('div');
		downvoteButtonRipple.classList.add('r-sharp-downvote-button__ripple', 'mdc-ripple-surface');
		const ctx: MDCRipple = new MDCRipple(downvoteButtonRipple);
		downvoteButtonContainer.appendChild(downvoteButtonRipple);
		ctx.unbounded = true;

		const downvoteButtonIcon: HTMLElement = document.createElement('i');
		downvoteButtonIcon.classList.add('r-sharp-icons__downvote');
		downvoteButtonContainer.appendChild(downvoteButtonIcon);

		el.appendChild(downvoteButtonContainer);

		el.addEventListener('click', (): void => el.quark.downvote());

		el.quark = new this.#QuarkData(el, args.constructor.post, ctx, args.constructor.link.likes);
	}

}