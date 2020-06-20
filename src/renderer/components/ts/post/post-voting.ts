import quark from '@quark.js/core';
import * as Kuudere from 'kuudere';
import { Post } from './post';
import { PostConstructor, PostChildConstructor } from './interfaces';
//import { PostArguments } from './post';
import { QuarkHTMLElement } from '../../../quark-element';
import { RedditVoteType } from '../../../api/link';
import { RedditLink } from '../../../../main/api/reddit-types';
import { JSONDom } from '../../../utils/json-dom';
import * as api from '../../../api';
import * as utils from '../../../utils';
import dynamics from 'dynamics.js';
import { MDCRipple } from '@material/ripple';
/*
interface PostVotingConstructor extends PostConstructor { post: QuarkHTMLElement; }

interface PostVotingArguments extends PostArguments { constructor: PostVotingConstructor; }

export class PostVoting extends quark.Component
{
	#QuarkData = class
	{
		#element: QuarkHTMLElement;
		#link: RedditLink;
		#post: QuarkHTMLElement;
		#upvoted: boolean = false;
		#downvoted: boolean = false;
		#upvoteButton?: QuarkHTMLElement;
		#downvoteButton?: QuarkHTMLElement;

		get upvoted(): boolean { return this.#upvoted; }

		get downvoted(): boolean { return this.#downvoted; }

		public upvote(): void
		{
			if (!this.#upvoted)
			{
				if (this.#downvoted) this.#link.downs--;
				this.#link.ups++;
				const votingNumbers: HTMLElement|null = this.#element.querySelector('.r-sharp-voting__text');
				if (votingNumbers != null)
				{
					this.#link.score = this.#link.ups - this.#link.downs;
					votingNumbers.innerHTML = utils.prettyNumber(this.#link.score);
					votingNumbers.setAttribute('upvoted', '');
					votingNumbers.removeAttribute('downvoted');
					this.#upvoted = true;
					this.#downvoted = false;
					this.#update();
					api.link.vote(`t3_${this.#link.id}`, RedditVoteType.up).then((ok: boolean): void =>
					{
						if (!ok)
						{
							console.warn(`Failed to upvote "${this.#link.title}". The user will be notified.`);
							//TODO: ADD NOTIFICATION FOR USER.
						}
					});
				} else this.#panic();
			}
		}

		public unupvote(): void
		{
			if (this.#upvoted)
			{
				this.#link.ups--;
				const votingNumbers: HTMLElement|null = this.#element.querySelector('.r-sharp-voting__text');
				if (votingNumbers != null)
				{
					this.#link.score = this.#link.ups - this.#link.downs;
					votingNumbers.innerHTML = utils.prettyNumber(this.#link.score);
					votingNumbers.removeAttribute('upvoted');
					this.#upvoted = false;
					this.#downvoted = false;
					this.#update();
					api.link.vote(`t3_${this.#link.id}`, RedditVoteType.none).then((ok: boolean): void =>
					{
						if (!ok)
						{
							console.warn(`Failed to unupvote "${this.#link.title}". The user will be notified.`);
							//TODO: ADD NOTIFICATION FOR USER.
						}
					});
				} else this.#panic();
			}
		}

		public downvote(): void
		{
			if (!this.#downvoted)
			{
				if (this.#upvoted) this.#link.ups--;
				this.#link.downs++;
				const votingNumbers: HTMLElement|null = this.#element.querySelector('.r-sharp-voting__text');
				if (votingNumbers != null)
				{
					this.#link.score = this.#link.ups - this.#link.downs;
					votingNumbers.innerHTML = utils.prettyNumber(this.#link.score);
					votingNumbers.setAttribute('downvoted', '');
					votingNumbers.removeAttribute('upvoted');
					this.#upvoted = false;
					this.#downvoted = true;
					this.#update();
					api.link.vote(`t3_${this.#link.id}`, RedditVoteType.down).then((ok: boolean): void =>
					{
						if (!ok)
						{
							console.warn(`Failed to downvote "${this.#link.title}". The user will be notified.`);
							//TODO: ADD NOTIFICATION FOR USER.
						}
					});
				} else this.#panic();
			}
		}

		public undownvote(): void
		{
			if (this.#downvoted)
			{
				this.#link.downs--;
				const votingNumbers: HTMLElement|null = this.#element.querySelector('.r-sharp-voting__text');
				if (votingNumbers != null)
				{
					this.#link.score = this.#link.ups - this.#link.downs;
					votingNumbers.innerHTML = utils.prettyNumber(this.#link.score);
					votingNumbers.removeAttribute('downvoted');
					this.#upvoted = false;
					this.#downvoted = false;
					this.#update();
					api.link.vote(`t3_${this.#link.id}`, RedditVoteType.none).then((ok: boolean): void =>
					{
						if (!ok)
						{
							console.warn(`Failed to undownvote "${this.#link.title}". The user will be notified.`);
							//TODO: ADD NOTIFICATION FOR USER.
						}
					});
				} else this.#panic();
			}
		}

		#update = (): void =>
		{
			this.#upvoteButton?.quark.update();
			this.#downvoteButton?.quark.update();
		};

		#panic = (): void =>
		{
			this.#element.remove();
			console.log('A PostVoting component lacks one or more of its required components, and as such can no longer function. The component will be removed.');
		};

		constructor(el: QuarkHTMLElement, link: RedditLink, post: QuarkHTMLElement)
		{
			this.#element = el;
			this.#link = link;
			this.#post = post;
			const upvoteButton: QuarkHTMLElement|null = this.#element.querySelector('.r-sharp-voting *:nth-child(1)');
			const downvoteButton: QuarkHTMLElement|null = this.#element.querySelector('.r-sharp-voting *:nth-child(3)');
			if (upvoteButton != null && downvoteButton != null)
			{
				this.#upvoteButton = upvoteButton;
				this.#downvoteButton = downvoteButton;
			}
			else this.#panic();
		}
	}

	constructor(el: QuarkHTMLElement, args: PostVotingArguments)
	{
		super(el, args);

		const content: JSONDom = new JSONDom
		([
			{ _: 'div', $: { 'class': 'r-sharp-voting' }, '': [
				quark.replace
				(
					document.createElement('div'),
					{
						component: 'upvote-button',
						constructor:
						{
							post: args.constructor.post,
							link: args.constructor.link,
						},
						element: {},
					}
				) || document.createElement('div'),
				{ _: 'div', $: { 'class': 'r-sharp-voting__text' }, '': [ utils.prettyNumber(args.constructor.link.score) ] },
				quark.replace
				(
					document.createElement('div'),
					{
						component: 'downvote-button',
						constructor:
						{
							post: args.constructor.post,
							link: args.constructor.link,
						},
						element: {},
					}
				) || document.createElement('div'),
			] }
		]);

		content.toDom().forEach((v: HTMLElement|string): void =>
		{
			if (typeof v !== 'string') el.appendChild(v);
			else el.innerHTML += v;
		});

		el.quark = new this.#QuarkData(el, args.constructor.link, args.constructor.post);
	}
}*/

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