import * as Kuudere from 'kuudere';
import dynamics from 'dynamics.js';
import * as utils from '../../../utils';
import { Post } from './post';
import { PostChildConstructor } from './interfaces';
import { RedditLink } from '../../../../main/api/reddit-types';

export class PostVoting extends Kuudere.Component<PostChildConstructor>
{
	#link: RedditLink;

	#content:
	{
		upvote:
		{
			onMouseUp: (el: Kuudere.HTMLKuudereComponent<PostVotingButton>, e: MouseEvent) => void;
			element?: Kuudere.HTMLKuudereComponent<PostVotingButton>; 
		};
		downvote:
		{
			onMouseUp: (el: Kuudere.HTMLKuudereComponent<PostVotingButton>, e: MouseEvent) => void;
			element?: Kuudere.HTMLKuudereComponent<PostVotingButton>;
		};
		text:
		{
			element?: HTMLDivElement;
		};
		parent?: Kuudere.HTMLKuudereComponent<Post>;
		element?: Kuudere.HTMLKuudereComponent<PostVoting>;
	} =
	{
		upvote:
		{
			onMouseUp: (el: Kuudere.HTMLKuudereComponent<PostVotingButton>, e: MouseEvent): void =>
			{
				if (e.button === 0)
				{
					el.__props.animate();
					if (!this.#content.parent!.__props.likes)
						this.#content.parent!.__props.vote(1);
					else
						this.#content.parent!.__props.vote(0);
				}
			},
		},
		downvote:
		{
			onMouseUp: (el: Kuudere.HTMLKuudereComponent<PostVotingButton>, e: MouseEvent): void =>
			{
				if (e.button === 0)
				{
					el.__props.animate();
					if (!(this.#content.parent!.__props.likes != null))
						this.#content.parent!.__props.vote(-1);
					else
						this.#content.parent!.__props.vote(0);	
				}
			},
		},
		text: {},
	};

	public update(): void
	{
		if (this.#content.parent!.__props.likes != null)
		{
			if (this.#content.parent!.__props.likes)
			{
				this.#content.upvote.element!.__props.update(true);
				this.#content.downvote.element!.__props.update(false);
				this.#content.text.element!.innerHTML = utils.prettyNumber(this.#content.parent!.__props.score);
				this.#content.text.element!.setAttribute('upvoted', '');
				this.#content.text.element!.removeAttribute('downvoted');
			}
			else
			{
				this.#content.upvote.element!.__props.update(false);
				this.#content.downvote.element!.__props.update(true);
				this.#content.text.element!.innerHTML = utils.prettyNumber(this.#content.parent!.__props.score);
				this.#content.text.element!.setAttribute('downvoted', '');
				this.#content.text.element!.removeAttribute('upvoted');
			}
		}
		else
		{
			this.#content.upvote.element!.__props.update(false);
			this.#content.downvote.element!.__props.update(false);
			this.#content.text.element!.innerHTML = utils.prettyNumber(this.#content.parent!.__props.score);
			this.#content.text.element!.removeAttribute('upvoted');
			this.#content.text.element!.removeAttribute('downvoted');
		}
	}

	constructor(el: Kuudere.HTMLKuudereComponent<PostVoting>, args: Kuudere.Arguments<PostChildConstructor>)
	{
		super(el, args);

		this.#content.element = el;
		this.#content.parent = args.constructor.parent;
		this.#link = args.constructor.link;

		this.#content.element.classList.add('r-sharp-post__voting');

		const { div } = Kuudere.WebScript.HTML();

		this.#content.element.appendChildren
		(
			Kuudere.constructComponent
			(
				'div',
				PostVotingButton,
				{
					constructor:
					{
						color: '#ff4500',
						hoverColor: '#cc3700',
						flip: false,
						parent: this.#content.element,
						onMouseUp: this.#content.upvote.onMouseUp,
					},
					init: (el): void => { el.classList.add('r-sharp-post__voting__upvote'); },
				}
			),
			div.class`r-sharp-post__voting__text`(utils.prettyNumber(this.#link.ups - this.#link.downs)),
			Kuudere.constructComponent
			(
				'div',
				PostVotingButton,
				{
					constructor:
					{
						color: '#7193ff',
						hoverColor: '#5a75cc',
						flip: true,
						parent: this.#content.element,
						onMouseUp: this.#content.downvote.onMouseUp,
					},
					init: (el): void => { el.classList.add('r-sharp-post__voting__downvote'); },
				}
			)
		);

		this.#content.upvote.element = <Kuudere.HTMLKuudereComponent<PostVotingButton>>this.#content.element.querySelector('.r-sharp-post__voting__upvote')!;
		this.#content.downvote.element = <Kuudere.HTMLKuudereComponent<PostVotingButton>>this.#content.element.querySelector('.r-sharp-post__voting__downvote')!;
		this.#content.text.element = <HTMLDivElement>this.#content.element.querySelector('.r-sharp-post__voting__text')!;

		window.setTimeout((): void => this.update(), 1);
	}
}

interface PostVotingButtonConstructor
{
	color: string;
	hoverColor: string;
	flip: boolean;
	parent: Kuudere.HTMLKuudereComponent<PostVoting>;
	onMouseUp: (el: Kuudere.HTMLKuudereComponent<PostVotingButton>, e: MouseEvent) => void;
}

export class PostVotingButton extends Kuudere.Component<PostVotingButtonConstructor>
{
	#canAnimate: boolean = true;
	
	#flip: boolean;

	#content:
	{
		parent?: Kuudere.HTMLKuudereComponent<PostVoting>;
		element?: Kuudere.HTMLKuudereComponent<PostVotingButton>;
	} = {};

	public update(active: boolean): void
	{
		if (active) this.#content.element!.querySelector('i')!.setAttribute('active', '');
		else this.#content.element!.querySelector('i')!.removeAttribute('active');
	}

	public animate(): void
	{
		if (this.#canAnimate)
		{
			this.#canAnimate = false;
			dynamics.animate
			(
				this.#content.element,
				{ translateY: 16 * ((this.#flip) ? 1 : -1) },
				{
					type: dynamics.bounce,
					duration: 300,
					frequency: 100,
					friction: 75,
					complete: this.allowAnimation(),
				}
			);
		}
	}

	public allowAnimation(): void { this.#canAnimate = true; }

	constructor(el: Kuudere.HTMLKuudereComponent<PostVotingButton>, args: Kuudere.Arguments<PostVotingButtonConstructor>)
	{
		super(el, args);

		this.#content.element = el;
		this.#content.parent = args.constructor.parent;
		this.#flip = args.constructor.flip;

		this.#content.element.classList.add('r-sharp-post__voting__vote-button', 'mdc-ripple-surface');
		this.#content.element.style.setProperty('--r-sharp-post__voting__vote-button__color', args.constructor.color);

		const { i } = Kuudere.WebScript.HTML(); 

		if (!this.#flip) this.#content.element.appendChild(i.class`r-sharp-icons__upvote```);
		else this.#content.element.appendChild(i.class`r-sharp-icons__downvote```);

		this.#content.element.addEventListener('mouseup', (e: MouseEvent): void =>
		{
			args.constructor.onMouseUp(this.#content.element!, e);
		});
	}
}