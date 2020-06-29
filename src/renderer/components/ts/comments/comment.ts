import * as Kuudere from 'kuudere';
import { Comments } from '.';
import { RedditComment, ChildComment } from '.';

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
				header: {},
				content: {},
			},
		},
		replies:
		{
			children: [],
		},
	};

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

		const { div } = Kuudere.WebScript.HTML();

		this.#content.element.appendChildren
		(
			div.class`r-sharp-comment__body`(
				div.class`r-sharp-comment__body__left`(

				),
				div.class`r-sharp-comment__body__right`(
					div.class`r-sharp-comment__body__right__header`(
						div.class`r-sharp-comment__body__right__header__user``u/${this.#comment.author}`,
						div.class`r-sharp-comment__body__right__header__flair``${this.#comment.author_flair_text||''}`),
					div.class`r-sharp-comment__body__right__content```)),
			div.class`r-sharp-comment__replies```
		);

		this.#content.body.element = <HTMLDivElement>this.#content.element.querySelector('.r-sharp-comment__body');
		this.#content.body.left.element = <HTMLDivElement>this.#content.element.querySelector('.r-sharp-comment__body__left');
		this.#content.body.right.element = <HTMLDivElement>this.#content.element.querySelector('.r-sharp-comment__body__right');
		this.#content.body.right.header.element = <HTMLDivElement>this.#content.element.querySelector('.r-sharp-comment__body__right__header');
		this.#content.body.right.content.element = <HTMLDivElement>this.#content.element.querySelector('.r-sharp-comment__body__right__content');
		this.#content.replies.element = <HTMLDivElement>this.#content.element.querySelector('.r-sharp-comment__replies');

		try
		{
			this.#content.body.right.content.element.innerHTML = this.#comment.body_html.replace(/&lt;/gm, '<').replace(/&gt;/gm, '>');
			
			if (this.#comment.replies.data != null)
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
		}
		catch { this.#content.element!.remove(); console.warn(`[Comment]: A Comment component ran into problematic data. Logging the data here.`, this.#comment); }
	}
}
