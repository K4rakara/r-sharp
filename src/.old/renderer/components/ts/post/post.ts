import * as Kuudere from 'kuudere';
import { MDCRipple } from '@material/ripple';
import * as utils from '../../../utils';
import * as api from '../../../api';
import { PostAwards } from './post-awards';
import { PostButtons } from './post-buttons';
import { PostConstructor } from './interfaces';
import { PostPreview } from './post-preview';
import { PostVoting } from './post-voting';
import { RedditVoteType } from '../../../api/link';
import { RedditLink } from '../../../../main/api/reddit-types';

export class Post extends Kuudere.Component<PostConstructor>
{
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
		element?: Kuudere.HTMLKuudereComponent<Post>;
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

	public get likes(): boolean|null { return this.#link.likes; }

	public get score(): number { return this.#link.ups - this.#link.downs; }

	public get saved(): boolean { return this.#link.saved; }

	public vote(direction: RedditVoteType): void
	{
		const oldLikes: boolean|null = this.#link.likes;
		const oldUps: number = this.#link.ups;
		const oldDowns: number = this.#link.downs;
		switch (direction)
		{
			case RedditVoteType.up:
				if (this.#link.likes != null)
					if (!this.#link.likes) { this.#link.downs--; this.#link.ups++; }
					else;
				else
					this.#link.ups++;
				this.#link.likes = true;
				break;
			case RedditVoteType.down:
				if (this.#link.likes != null)
					if (this.#link.likes) { this.#link.ups--; this.#link.downs++; }
					else;
				else
					this.#link.downs++;
				this.#link.likes = false;
				break;
			case RedditVoteType.none:
				if (this.#link.likes != null)
					if (this.#link.likes) this.#link.ups--;
					else this.#link.downs--;
				this.#link.likes = null;
				break;
		}
		api.link.vote(`t3_${this.#link.id}`, direction).then((ok: boolean): void =>
		{
			if (!ok)
			{
				if (window.ifcFrame != null)
				{
					window.ifcFrame.send
					(
						'r-sharp:create-snackbar',
						{
							text: 'Failed to vote... Please try again later.',
							color: '#EA0027',
							icon: 'file:assets/snoo_facepalm.png',
						},
					);
					this.#link.likes = oldLikes;
					this.#link.ups = oldUps;
					this.#link.downs = oldDowns;
					this.#content.left.voting.element!.__props.update();
				}
				else null;
			}
		});
		this.#content.left.voting.element!.__props.update();
	}

	public save(save: boolean): void
	{
		const oldSaved: boolean = this.#link.saved;
		this.#link.saved = save;
		api.link.save(`t3_${this.#link.id}`, save).then((ok: boolean): void =>
		{
			if (ok)
			{
				if (window.ifcFrame != null)
				{
					window.ifcFrame.send
					(
						'r-sharp:create-snackbar',
						{
							text: `Post ${(save) ? 'saved' : 'unsaved'} successfully!`,
							color: '#0079d3',
							icon: 'file:assets/snoo_smile.png',
							buttons: [{
								text: 'undo',
								lifespan: 10000,
								onclick: (): void => { this.save(!save); }
							}]
						}
					);
				}
			}
			else
			{
				if (window.ifcFrame != null)
				{
					window.ifcFrame.send
					(
						'r-sharp:create-snackbar',
						{
							text: `Failed to ${(save) ? 'save' : 'unsave'}... Please try again later.`,
							color: '#ea0027',
							icon: 'file:assets/snoo_facepalm.png',
						}
					);
					this.#link.saved = oldSaved;
					this.#content.right.buttons!.__props.update();
				}
			}
		});
		this.#content.right.buttons!.__props.update();
	}

	public openPostOverlay(): void
	{
		if (window.ifcFrame != null)
		{
			window.ifcFrame.send
			(
				'r-sharp:create-post-overlay',
				{
					link: this.#link,
					puppet: this.#content.element!,
				}
			);
		}
	}

	public openShareOverlay(): void
	{
		if (window.ifcFrame != null)
		{
			window.ifcFrame.send
			(
				'r-sharp:show-share-menu',
				{
					type: `link:${this.#link.post_hint}`,
					v: this.#link,
					el: this.#content.element!,
				}
			);
		}
	}

	constructor(el: Kuudere.HTMLKuudereComponent<Post>, args: Kuudere.Arguments<PostConstructor>)
	{
		super(el, args);

		this.#link = args.constructor.link;
		this.#content.element = el;

		this.#content.element.classList.add('r-sharp-post');
		
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
							readyForFullLoad: args.constructor.readyForFullLoad,
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
							readyForFullLoad: args.constructor.readyForFullLoad,
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
							readyForFullLoad: args.constructor.readyForFullLoad,
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
							readyForFullLoad: args.constructor.readyForFullLoad,
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