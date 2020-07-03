import * as Kuudere from 'kuudere';
import {
	CommentVotingConstructor,
	Comment,
	RedditComment,
	CommentVotingButtonConstructor,
} from '.';
import * as utils from '../../../utils';
import dynamics from 'dynamics.js';
import { MDCRipple } from '@material/ripple';

export class CommentVoting extends Kuudere.Component<CommentVotingConstructor>
{
	private comment: RedditComment;

	private content:
	{
		upvote:
		{
			onMouseUp: (e: MouseEvent) => void;
			element?: Kuudere.HTMLKuudereComponent<CommentVotingButton>;
		};
		text:
		{
			element?: HTMLDivElement;
		};
		downvote:
		{
			onMouseUp: (e: MouseEvent) => void;
			element?: Kuudere.HTMLKuudereComponent<CommentVotingButton>;
		};
		parent?: Kuudere.HTMLKuudereComponent<Comment>;
		element?: Kuudere.HTMLKuudereComponent<CommentVoting>;
	} =
	{
		upvote:
		{
			onMouseUp: (e: MouseEvent): void =>
			{
				if (e.button === 0)
				{
					this.content.upvote.element!.__props.animate();
					if (!this.content.parent!.__props.likes)
						this.content.parent!.__props.vote(1);
					else
						this.content.parent!.__props.vote(0);
				}
			}
		},
		text:
		{
		},
		downvote:
		{
			onMouseUp: (e: MouseEvent): void =>
			{
				if (e.button === 0)
				{
					this.content.downvote.element!.__props.animate();
					if (!(this.content.parent!.__props.likes != null))
						this.content.parent!.__props.vote(-1);
					else
						this.content.parent!.__props.vote(0);
				}
			},
		},
	};

	public update(): void
	{
		if (this.content.parent!.__props.likes != null)
		{
			if (this.content.parent!.__props.likes)
			{
				this.content.upvote.element!.__props.update(true);
				this.content.downvote.element!.__props.update(false);
				this.content.text.element!.innerHTML = utils.prettyNumber(this.content.parent!.__props.score);
				this.content.text.element!.setAttribute('upvoted', '');
				this.content.text.element!.removeAttribute('downvoted');
			}
			else
			{
				this.content.upvote.element!.__props.update(false);
				this.content.downvote.element!.__props.update(true);
				this.content.text.element!.innerHTML = utils.prettyNumber(this.content.parent!.__props.score);
				this.content.text.element!.removeAttribute('upvoted');
				this.content.text.element!.setAttribute('downvoted', '');
			}
		}
		else
		{
			this.content.upvote.element!.__props.update(false);
			this.content.downvote.element!.__props.update(false);
			this.content.text.element!.innerHTML = utils.prettyNumber(this.content.parent!.__props.score);
			this.content.text.element!.removeAttribute('upvoted');
			this.content.text.element!.removeAttribute('downvoted');
		}
	}

	constructor(el: Kuudere.HTMLKuudereComponent<CommentVoting>, args: Kuudere.Arguments<CommentVotingConstructor>)
	{
		super(el, args);

		// Assign values to protected properties.
		this.content.element = el;
		this.content.parent = args.constructor.parent;
		this.comment = args.constructor.comment;

		// Add a class to the element.
		el.classList.add('_voting');

		// Create references to protected properties.
		const comment = this.comment;

		// Create elements content.
		const { div } = Kuudere.WebScript.HTML();

		el.appendChildren
		(
			Kuudere.constructComponent
			(
				'div',
				CommentVotingButton,
				{
					constructor:
					{
						color: '#ff4500',
						hoverColor: '#cc3700',
						flip: false,
						parent: el,
					},
					listeners: { 'mouseup': this.content.upvote.onMouseUp },
					init: (el): void => { el.classList.add('_upvote') },
				}
			),
			div.class`_text``${utils.prettyNumber(comment.ups - comment.downs)}`,
			Kuudere.constructComponent
			(
				'div',
				CommentVotingButton,
				{
					constructor:
					{
						color: '#7193ff',
						hoverColor: '#5a75cc',
						flip: true,
						parent: el,
						onMouseUp: this.content.upvote.onMouseUp,
					},
					listeners: { 'mouseup': this.content.downvote.onMouseUp },
					init: (el): void => { el.classList.add('_downvote'); },
				}
			),
		);

		this.content.upvote.element = <Kuudere.HTMLKuudereComponent<CommentVotingButton>>el.querySelector('._upvote');
		this.content.text.element = <HTMLDivElement>el.querySelector('._text');
		this.content.downvote.element = <Kuudere.HTMLKuudereComponent<CommentVotingButton>>el.querySelector('._downvote');
	}
}

export class CommentVotingButton extends Kuudere.Component<CommentVotingButtonConstructor>
{
	private flip: boolean = false;

	private canAnimate: boolean = true;

	private content:
	{
		parent?: Kuudere.HTMLKuudereComponent<CommentVoting>;
		element?: Kuudere.HTMLKuudereComponent<CommentVotingButton>;
	} = {};

	public update(to: boolean)
	{
		if (to) this.content.element!.setAttribute('active', '');
		else this.content.element!.removeAttribute('active');
	}

	public animate(): void
	{
		if (this.canAnimate)
		{
			this.canAnimate = false;
			dynamics.animate
			(
				this.content.element,
				{ translateY: 16 * ((this.flip) ? 1 : -1) },
				{
					type: dynamics.bounce,
					duration: 300,
					frequency: 100,
					friction: 75,
					complete: (): void => { this.canAnimate = true; },
				}
			)
		}
	}

	constructor(el: Kuudere.HTMLKuudereComponent<CommentVotingButton>, args: Kuudere.Arguments<CommentVotingButtonConstructor>)
	{
		super(el, args);

		this.content.element = el;
		this.content.parent = args.constructor.parent;
		this.flip = args.constructor.flip;

		el.classList.add('_vote-button', 'mdc-ripple-surface');

		const { i } = Kuudere.WebScript.HTML();

		if (!this.flip)
			el.appendChild(i.class`r-sharp-icons__upvote```);
		else
			el.appendChild(i.class`r-sharp-icons__downvote```);

		MDCRipple.attachTo(el);
	}
}