import * as Kuudere from 'kuudere';
import { Comments } from '.';
import { RedditComment, ChildComment, CommentButtons } from '.';
import { CommentVoting } from './comment-voting';
import * as utils from '../../../utils';

interface CommentConstructor
{
	comment: RedditComment;
	parent: Kuudere.HTMLKuudereComponent<Comments>|Kuudere.HTMLKuudereComponent<Comment>;
	rootParent: Kuudere.HTMLKuudereComponent<Comments>;
}

export class Comment extends Kuudere.Component<CommentConstructor>
{
	#comment: RedditComment;

	#content:
	{
		body:
		{
			left:
			{
				element?: HTMLDivElement;
			};
			right:
			{
				header:
				{
					user:
					{
						icon: { img: { element?: HTMLImageElement; };  element?: HTMLSpanElement; };
						name: { element?: HTMLSpanElement; };
						flair: { element?: HTMLSpanElement; };
						element?: HTMLDivElement;
					};
					element?: HTMLDivElement;
				};
				content:
				{
					element?: HTMLDivElement;
				};
				element?: HTMLDivElement;
			};
			element?: HTMLDivElement;
		};
		replies:
		{
			children: ChildComment[];
			element?: HTMLDivElement;
		};
		parent?: Kuudere.HTMLKuudereComponent<Comments>|Kuudere.HTMLKuudereComponent<Comment>;
		rootParent?: Kuudere.HTMLKuudereComponent<Comments>;
		element?: Kuudere.HTMLKuudereComponent<Comment>;
	} =
	{
		body:
		{
			left: {},
			right:
			{
				header:
				{
					user:
					{
						icon: { img: {} },
						name: {},
						flair: {},
					},
				},
				content: {},
			},
		},
		replies:
		{
			children: [],
		},
	};

	public get likes(): boolean|null { return this.#comment.likes || null; }

	public get score(): number { return this.#comment.ups - this.#comment.downs; }

	public vote(direction: -1|0|1): void
	{

	}

	public getChildren(): ChildComment[]
	{
		return this.#content.replies.children;
	}

	constructor(el: Kuudere.HTMLKuudereComponent<Comment>, args: Kuudere.Arguments<CommentConstructor>)
	{
		super(el, args);

		this.#comment = args.constructor.comment;
		this.#content.parent = args.constructor.parent;
		this.#content.rootParent = args.constructor.rootParent;
		this.#content.element = el;

		this.#content.element.classList.add('r-sharp-comment');

		const { div, span, img } = Kuudere.WebScript.HTML();

		this.#content.element.appendChildren
		(
			div.class`r-sharp-comment__body`(
				div.class`r-sharp-comment__body__left`(
					Kuudere.constructComponent
					(
						'div',
						CommentVoting,
						{
							constructor:
							{
								comment: this.#comment,
								//@ts-ignore
								link: null,
								parent: this.#content.element!,
							}
						}
					)),
				div.class`r-sharp-comment__body__right`(
					div.class`r-sharp-comment__body__right__header`(
						div.class`_user`(
							span.class`_icon`(
								img.src`${utils.getDefaultProfilePictureUrl()}`.draggable`false`),
							span.class`_name``u/${this.#comment.author}`,
							span.class`_flair``${this.#comment.author_flair_text || ''}`)),
					div.class`r-sharp-comment__body__right__content```,
					Kuudere.constructComponent
					(
						'div',
						CommentButtons,
						{
							constructor:
							{
								parent: this.#content.element!,
							}
						}
					))),
			div.class`r-sharp-comment__replies```
		);

		this.#content.body.element = <HTMLDivElement>this.#content.element.querySelector('.r-sharp-comment__body');
		this.#content.body.left.element = <HTMLDivElement>this.#content.element.querySelector('.r-sharp-comment__body__left');
		this.#content.body.right.element = <HTMLDivElement>this.#content.element.querySelector('.r-sharp-comment__body__right');
		this.#content.body.right.header.element = <HTMLDivElement>this.#content.element.querySelector('.r-sharp-comment__body__right__header');
		this.#content.body.right.header.user.element = <HTMLDivElement>this.#content.body.right.header.element!.querySelector('._user')!;
		this.#content.body.right.header.user.icon.element = <HTMLSpanElement>this.#content.body.right.header.user.element!.querySelector('._icon')!;
		this.#content.body.right.header.user.icon.img.element = <HTMLImageElement>this.#content.body.right.header.user.icon.element!.querySelector('img')!;
		this.#content.body.right.header.user.name.element = <HTMLSpanElement>this.#content.body.right.header.user.element!.querySelector('._name')!;
		this.#content.body.right.header.user.flair.element = <HTMLSpanElement>this.#content.body.right.header.user.element!.querySelector('._flair')!;
		this.#content.body.right.content.element = <HTMLDivElement>this.#content.element.querySelector('.r-sharp-comment__body__right__content');
		this.#content.replies.element = <HTMLDivElement>this.#content.element.querySelector('.r-sharp-comment__replies');

		try
		{
			this.#content.body.right.content.element.innerHTML = this.#comment.body_html.replace(/&lt;/gm, '<').replace(/&gt;/gm, '>');
			
			if (this.#comment.replies.data != null)
			{
				this.#comment.replies.data.children.forEach((child: { data: RedditComment; kind: string; }): void =>
				{
					this.#content.replies.children.push
					({
						children: [],
						comment: child.data,
						element: this.#content.replies.element!.appendChild
						(
							Kuudere.constructComponent
							(
								'div',
								Comment,
								{
									constructor:
									{
										comment: child.data,
										parent: this.#content.element!,
										rootParent: this.#content.rootParent!,
									}
								}
							)
						)
					});
					this.#content.replies.children[this.#content.replies.children.length - 1].children.push
						( ...this.#content.replies.children[this.#content.replies.children.length - 1].element!.__props.getChildren() );
				});
				(async (): Promise<void> =>
				{
					//@ts-ignore
					if (this.#comment.author != '[deleted]')
					{
						const json = await
						(
							await fetch
							(
								//@ts-ignore
								`https://www.reddit.com/u/${this.#comment.author}/about.json`,
							)
						).json();
						this.#content.body.right.header.user.icon.img.element!.src = utils.stripImageUrl(json.data.icon_img);
						this.#content.body.right.header.user.icon.element!.setAttribute('loaded', '');
					}
					else
						this.#content.body.right.header.user.icon.element!.setAttribute('loaded', '');
				})();
			}
		}
		catch { this.#content.element!.remove(); console.warn(`[Comment]: A Comment component ran into problematic data. Logging the data here.`, this.#comment); }
	}
}
