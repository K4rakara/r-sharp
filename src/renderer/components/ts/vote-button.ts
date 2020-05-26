import quark from '@quark.js/core';
import { MDCRipple } from '@material/ripple';
import dynamics from 'dynamics.js';

interface VoteButtonConstructor
{
	color: string;
	flip: boolean;
}

interface VoteButtonArguments
{
	tag?: string;
	component: string;
	constructor: VoteButtonConstructor;
	element: any;
}

export class VoteButton extends quark.Component
{
	
	#QuarkData = class
	{
		#element: HTMLElement;
		#context: MDCRipple;
		#color: string;
		#flip: boolean;
		#parentPost: undefined;

		get color(): string { return this.#color; }
		set color(v: string)
		{
			const voteButtonContainer: Element|null = this.#element.firstElementChild;
			if (voteButtonContainer != null)
			{
				const voteButtonContainer_ = <HTMLElement>voteButtonContainer;
				voteButtonContainer_.style.cssText += `--r-sharp-vote-button__color: ${v};`;
				this.#color = v;
			}
			else this.#panic();
		}
		
		get flip(): boolean { return this.#flip; }
		set flip(v: boolean)
		{
			const voteButtonIcon: HTMLElement|null = this.#element.querySelector('.r-sharp-vote-button__icon');
			if (voteButtonIcon != null)
			{
				if (!v) voteButtonIcon.classList.remove('flip');
				if (v) voteButtonIcon.classList.add('flip');
				this.#flip = v;
			}
			else this.#panic();
		}

		public vote(): void
		{
			const voteButtonIcon: HTMLElement|null = this.#element.querySelector('.r-sharp-vote-button__icon');
			const voteButtonRipple: HTMLElement|null = this.#element.querySelector('.r-sharp-vote-button__ripple');
			if (voteButtonIcon != null && voteButtonRipple != null)
			{
				if (voteButtonIcon.classList.contains('voted'))
					voteButtonIcon.classList.remove('voted');
				else
				{
					voteButtonIcon.classList.add('voted');
					dynamics.animate
					(
						voteButtonIcon,
						{
							translateY: 16 * ((!this.#flip) ? -1 : 1) 
						},
						{
							type: dynamics.bounce,
							duration: 300,
							frequency: 100,
							friction: 75,
						}
					);
					this.#context.activate();
					setTimeout((): void => this.deripple(), 4);
				}
			}
			else this.#panic();
		}

		public deripple(): void
		{
			this.#context.deactivate();
		}

		#panic = (): void =>
		{
			this.#element.remove();
			console.log(`A VoteButton element lacked one or more critical elements for it to function, and will now be removed.`);
		}

		constructor(el: HTMLElement, ctx: MDCRipple, color: string, flip: boolean)
		{
			this.#element = el;
			this.#context = ctx;
			this.#color = color;
			this.#flip = flip;
		}
	}

	constructor(el: HTMLElement, args: VoteButtonArguments)
	{
		super(el, args);

		const voteButtonContainer: HTMLDivElement = document.createElement('div');
		voteButtonContainer.classList.add('r-sharp-upvote-button');
		voteButtonContainer.style.cssText += `--r-sharp-vote-button__color: ${args.constructor.color};`;
		
		const voteButtonRipple: HTMLDivElement = document.createElement('div');
		voteButtonRipple.classList.add('r-sharp-vote-button__ripple', 'mdc-ripple-surface');
		const ctx: MDCRipple = new MDCRipple(voteButtonRipple);
		voteButtonContainer.appendChild(voteButtonRipple);
		ctx.unbounded = true;

		const voteButtonIcon: HTMLElement = document.createElement('i');
		voteButtonIcon.classList.add('r-sharp-vote-button__icon');
		if (args.constructor.flip) voteButtonIcon.classList.add('flip');
		voteButtonContainer.appendChild(voteButtonIcon);

		el.appendChild(voteButtonContainer);

		//@ts-ignore
		el.quark = new this.#QuarkData(el, ctx, args.constructor.color, args.constructor.flip);
	}

}