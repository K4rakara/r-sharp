import quark from '@quark.js/core';
import { QuarkHTMLElement } from '../../quark-element';
import { MDCRipple } from '@material/ripple';
import dynamics from 'dynamics.js';

interface UpvoteButtonConstructor
{
	post: QuarkHTMLElement;
}

interface UpvoteButtonArguments
{
	tag?: string;
	component: string;
	constructor: UpvoteButtonConstructor;
	element: any;
}

export class UpvoteButton extends quark.Component
{

	#QuarkData = class
	{
		#element: HTMLElement;
		#post: QuarkHTMLElement;
		#context: MDCRipple;
		#canAnimate: boolean = true;

		public upvote(): void
		{
			if (!this.#post.quark.upvoted) this.#post.quark.upvote();
			else this.#post.quark.unupvote();
			this.animate();
		}

		public animate(): void
		{
			const upvoteButtonIcon: HTMLElement|null = this.#element.querySelector('.r-sharp-icons__upvote');
			const upvoteButtonRipple: HTMLElement|null = this.#element.querySelector('.r-sharp-upvote-button__ripple');
			if (upvoteButtonIcon != null && upvoteButtonRipple != null)
			{
				if (this.#post.quark.upvoted)
					upvoteButtonIcon.classList.add('upvoted');
				else
					upvoteButtonIcon.classList.remove('upvoted');
				if (this.#canAnimate)
				{
					this.canAnimate = false;
					dynamics.animate
					(
						upvoteButtonIcon,
						{
							translateY: -16,
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
			const downvoteButtonIcon: HTMLElement|null = this.#element.querySelector('.r-sharp-icons__upvote');
			if (downvoteButtonIcon != null)
			{
				if (this.#post.quark.upvoted)
					downvoteButtonIcon.classList.add('upvoted');
				else
					downvoteButtonIcon.classList.remove('upvoted');
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
			console.log(`An UpvoteButton element lacked one or more critical elements for it to function, and will now be removed.`);
		}

		constructor(el: HTMLElement, post: QuarkHTMLElement, context: MDCRipple)
		{
			this.#element = el;
			this.#post = post;
			this.#context = context;
		}
	}

	constructor(el: QuarkHTMLElement, args: UpvoteButtonArguments)
	{
		super(el, args);

		const upvoteButtonContainer: HTMLDivElement = document.createElement('div');
		upvoteButtonContainer.classList.add('r-sharp-upvote-button');
		
		const upvoteButtonRipple: HTMLDivElement = document.createElement('div');
		upvoteButtonRipple.classList.add('r-sharp-upvote-button__ripple', 'mdc-ripple-surface');
		const ctx: MDCRipple = new MDCRipple(upvoteButtonRipple);
		upvoteButtonContainer.appendChild(upvoteButtonRipple);
		ctx.unbounded = true;

		const upvoteButtonIcon: HTMLElement = document.createElement('i');
		upvoteButtonIcon.classList.add('r-sharp-icons__upvote');
		upvoteButtonContainer.appendChild(upvoteButtonIcon);

		el.appendChild(upvoteButtonContainer);

		el.addEventListener('click', (): void => el.quark.upvote());

		el.quark = new this.#QuarkData(el, args.constructor.post, ctx);
	}

}