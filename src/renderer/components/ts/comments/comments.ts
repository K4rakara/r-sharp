import * as Kuudere from 'kuudere';
import { Post, RedditLink } from '../post';
import { RedditComments, RedditComment } from '../../../../main/api/reddit-types';
import * as api from '../../../api';
import {_} from '../../../../stdext';_;
import { Comment } from '.';

interface CommentsConstructor
{
	link: RedditLink;
	parent: Kuudere.HTMLKuudereComponent<Post>;
}

export interface ChildComment
{
	comment: RedditComment;
	children: ChildComment[];
	element?: Kuudere.HTMLKuudereComponent<Comment>;
}

export class Comments extends Kuudere.Component<CommentsConstructor>
{
	#sort: string = 'top';

	#comments?: RedditComments;

	#content:
	{
		addComment:
		{
			element?: HTMLDivElement;
		};
		comments:
		{
			children: ChildComment[];
			element?: HTMLDivElement;
		};
		element?: Kuudere.HTMLKuudereComponent<Comments>;
	} =
	{
		addComment: {},
		comments: { children: [] },
	};

	get sort(): string { return this.#sort; }
	set sort(to: string)
	{
		const ok: string[] =
		[
			'top',
			'confidence',
			'new',
			'controversial',
			'old',
			'random',
			'qa',
		];
		if (ok.includes(to))
		{
			this.#sort = to;
		}
		else
			console.warn(`[Comments]: Attempt to set __props.sort to an unacceptable value of "${to}". Acceptable values are: ${ok.map((v: string): string => `"${v}"`).join(', ', ', or ')}`);
	}

	constructor(el: Kuudere.HTMLKuudereComponent<Comments>, args: Kuudere.Arguments<CommentsConstructor>)
	{
		super(el, args);

		this.#content.element = el;

		this.#content.element!.classList.add('r-sharp-comments');
		
		const { div } = Kuudere.WebScript.HTML();

		this.#content.element.appendChildren
		(
			div.class`r-sharp-comments__add-comment`(),
			div.class`r-sharp-comments__comments`(),
		);

		this.#content.addComment.element = <HTMLDivElement>this.#content.element.querySelector('.r-sharp-comments__add-comment')!;
		this.#content.comments.element = <HTMLDivElement>this.#content.element.querySelector('.r-sharp-comments__comments')!;

		api.link.getComments
		(
			args.constructor.link.id,
			{
				context: 0,
				threaded: true,
				sort: 'top',
			}
		)
		.then((comments: RedditComments): void =>
		{
			this.#comments = comments;
			this.#comments[1].data.children.forEach((child: { data: RedditComment; kind: string; }): void =>
			{
				this.#content.comments.children.push
				({
					children: [],
					comment: child.data,
					element: this.#content.comments.element!.appendChild
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
									rootParent: this.#content.element!,
								}
							}
						)
					),
				});
				this.#content.comments.children[this.#content.comments.children.length - 1].children.push
					( ...this.#content.comments.children[this.#content.comments.children.length - 1].element!.__props.getChildren() );
			});
		});
	}
}

