import * as Kuudere from 'kuudere';
import { MDCRipple } from '@material/ripple';
import * as utils from '../../../utils';
import { Post } from '../post';
import { PostAwards } from '../post/post-awards';
import { PostVoting } from '../post/post-voting';
import { PostPreview } from '../post/post-preview';
import { PostButtons } from '../post/post-buttons';
import { RedditLink } from '../../../../main/api/reddit-types';
import { Comments } from '../comments';

interface PostOverlayConstructor
{
	link: RedditLink;
	puppet: Kuudere.HTMLKuudereComponent<Post>;
}

export class PostOverlay extends Kuudere.Component<PostOverlayConstructor>
{
	#content:
	{
		scrim:
		{
			onMouseUp: (el: HTMLDivElement, e: MouseEvent) => void;
			element?: HTMLDivElement;
		};
		main:
		{
			element?: HTMLDivElement;
		};
		element?: Kuudere.HTMLKuudereComponent<PostOverlay>;
	} = 
	{
		scrim:
		{
			onMouseUp: (el: HTMLDivElement, e: MouseEvent): void =>
				{ if (e.button === 0) this.close(); }
		},
		main:
		{

		},
	};

	public close(): void
	{
		this.#content.main.element!.scroll({ top: 0, behavior: 'auto' });
		this.#content.element!.removeAttribute('opened');
		setTimeout((): void =>
		{
			this.#content.element!.removeAttribute('visible');
			this.#content.element!.remove();
		}, 500);
	}

	constructor(el: Kuudere.HTMLKuudereComponent<PostOverlay>, args: Kuudere.Arguments<PostOverlayConstructor>)
	{
		super(el, args);

		el.classList.add('r-sharp-post-overlay');
		el.setAttribute('visible', '');

		this.#content.element = el;

		const { div } = Kuudere.WebScript.HTML();

		el.appendChildren
		(
			div
				.class`r-sharp-post-overlay__scrim r-sharp-scrim`
				.$listeners({ 'mouseup': this.#content.scrim.onMouseUp })``,
			div
				.class`r-sharp-post-overlay__main`
				.$listeners({
					'mouseup': (el: HTMLDivElement, e: MouseEvent): void =>
						{ if (e.target === el) this.close(); }
				})(
					div.class`r-sharp-post-overlay__content`(
						Kuudere.constructComponent
						(
							'div',
							PostOverlayBody,
							{ constructor: { ...args.constructor } }
						),
						Kuudere.constructComponent
						(
							'div',
							Comments,
							{
								constructor:
								{
									link: args.constructor.link,
									//@ts-ignore
									parent: null,
								}
							}
						)))
		);

		this.#content.main.element = <HTMLDivElement>this.#content.element.querySelector('.r-sharp-post-overlay__main')!;

		setTimeout((): void =>
		{
			el.setAttribute('opened', '');
		}, 10);
	}
}

export class PostOverlayBody extends Kuudere.Component<PostOverlayConstructor>
{
	#puppet: Kuudere.HTMLKuudereComponent<Post>;

	#link: RedditLink;

	#content:
	{
		left:
		{
			voting:
			{

				element?: Kuudere.HTMLKuudereComponent<PostVoting>;
			};
			element?: HTMLDivElement;
		};
		right:
		{
			header:
			{
				details:
				{
					subreddit:
					{
						onMouseUp: (el: HTMLDivElement, e: MouseEvent) => void;
						element?: HTMLDivElement;
					};
					user:
					{
						onMouseUp: (el: HTMLSpanElement, e: MouseEvent) => void;
						element?: HTMLSpanElement;
					};
					element?: HTMLDivElement;
				};
				title:
				{
					onMouseUp: (el: HTMLDivElement, e: MouseEvent) => void;
					element?: HTMLDivElement;
				};
				element?: HTMLDivElement;
			};
			buttons?: Kuudere.HTMLKuudereComponent<PostButtons>;
			element?: HTMLDivElement;
		};
		element?: Kuudere.HTMLKuudereComponent<PostOverlayBody>;
	} =
	{
		left:
		{
			voting:
			{

			},
		},
		right:
		{
			header:
			{
				details:
				{
					subreddit:
					{
						onMouseUp: (el: HTMLDivElement, e: MouseEvent): void =>
						{
							if (e.button === 0) null; // TODO: Add new tab functionality, and allow opening the subreddit in a new tab.
						},
					},
					user:
					{
						onMouseUp: (el: HTMLSpanElement, e: MouseEvent): void =>
						{
							if (e.button === 0)
							{
								// TODO: Open the users profile in a pop-up window.
							}
							else if (e.button === 2)
							{
								// TODO: Allow opening the users profile in a new tab via the context menu.
							}
						}
					},
				},
				title:
				{
					onMouseUp: (el: HTMLDivElement, e: MouseEvent): void =>
					{
						if (e.button === 0)
						{
							// TODO: Open subreddit in new tab.
						}
					},
				},
			},
		},
	};

	public get likes(): boolean|null { return this.#puppet.__props.likes; };

	public get score(): number { return this.#puppet.__props.score; };

	public get saved(): boolean { return this.#puppet.__props.saved; };

	public vote(direction): void
	{
		this.#puppet.__props.vote(direction);
		this.#content.left.voting.element!.__props.update();
	}

	public save(save: boolean): void
	{
		this.#puppet.__props.save(save);
		this.#content.right.buttons!.__props.update();
	}

	public openPostOverlay(): void {}

	public openShareOverlay(): void { this.#puppet.__props.openShareOverlay(); }

	constructor(el: Kuudere.HTMLKuudereComponent<PostOverlayBody>, args: Kuudere.Arguments<PostOverlayConstructor>)
	{
		super(el, args);

		this.#puppet = args.constructor.puppet;
		this.#link = args.constructor.link;

		this.#content.element = el;

		this.#content.element.classList.add('r-sharp-post');
		this.#content.element.setAttribute('full', '');
		
		const { div } = Kuudere.WebScript.HTML();

		// Append elements.
		this.#content.element.appendChildren
		(
			div.class`r-sharp-post__left`(
				Kuudere.constructComponent
				(
					'div',
					PostVoting,
					{
						constructor:
						{
							link: this.#link,
							parent: this.#content.element!,
							readyForFullLoad: new Promise<void>((r) => r()),
						}
					}
				)),
			div.class`r-sharp-post__right`(
				div.class`r-sharp-post__header`(
					div.class`r-sharp-post__header__details`(
						div
							.class`r-sharp-post__header__details__subreddit mdc-ripple-surface`
							.$listeners({ 'mouseup': this.#content.right.header.details.subreddit.onMouseUp })(
								this.#link.subreddit_name_prefixed),
						div.class`r-sharp-post__header__details__separator```,
						div.class`r-sharp-post__header__details__user`(
							`Posted by `,
							div
								.class`r-sharp-post__header__details__user-link mdc-ripple-surface`
								.$listeners({ 'mouseup': this.#content.right.header.details.user.onMouseUp })(
									`u/${this.#link.author}`)),
						div.class`r-sharp-post__header__details__separator```,
						div.class`r-sharp-post__header__details__timestamp``${utils.prettyTimestampRoughStatic(new Date(this.#link.created))}`),
					div
						.class`r-sharp-post__header__title`
						.$listeners({ 'mouseup': this.#content.right.header.title.onMouseUp })(
							this.#link.title)),
				Kuudere.constructComponent
				(
					'div',
					PostAwards,
					{
						constructor:
						{
							link: args.constructor.link,
							parent: this.#content.element,
							readyForFullLoad: new Promise<void>((r) => r()),
						}
					}
				),
				Kuudere.constructComponent
				(
					'div',
					PostPreview,
					{
						constructor:
						{
							link: args.constructor.link,
							parent: this.#content.element,
							readyForFullLoad: new Promise<void>((r) => r()),
						}
					},
				),
				Kuudere.constructComponent
				(
					'div',
					PostButtons,
					{
						constructor:
						{
							link: args.constructor.link,
							parent: this.#content.element,
							readyForFullLoad: new Promise<void>((r) => r()),
						}
					}
				))
		);

		// Create references to elements.
		this.#content.left.element = <HTMLDivElement>this.#content.element.querySelector('.r-sharp-post__left')!;
		this.#content.left.voting.element = <Kuudere.HTMLKuudereComponent<PostVoting>>this.#content.left.element.querySelector('.r-sharp-post__voting')!;
		this.#content.right.element = <HTMLDivElement>this.#content.element.querySelector('.r-sharp-post__right')!;
		this.#content.right.header.element = <HTMLDivElement>this.#content.right.element.querySelector('.r-sharp-post__header')!;
		this.#content.right.header.details.element = <HTMLDivElement>this.#content.right.header.element.querySelector('.r-sharp-post__header__details')!;
		this.#content.right.header.details.subreddit.element = <HTMLDivElement>this.#content.right.header.details.element.querySelector('.r-sharp-post__header__details__subreddit')!;
		this.#content.right.header.details.user.element = <HTMLSpanElement>this.#content.right.header.details.element.querySelector('.r-sharp-post__header__details__user-link')!;
		this.#content.right.header.title.element = <HTMLDivElement>this.#content.right.header.element.querySelector('.r-sharp-post__header__title')!;
		this.#content.right.buttons = <Kuudere.HTMLKuudereComponent<PostButtons>>this.#content.right.element.querySelector('.r-sharp-post__buttons')!;

		// Init all MDC ripples.
		{
			this.#content.element.querySelectorAll('.mdc-ripple-surface').forEach((ripple: Element): void =>
			{
				MDCRipple.attachTo(ripple);
			});
		}
	}
}