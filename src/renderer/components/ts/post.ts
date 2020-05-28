import quark from '@quark.js/core';
import { Card } from './card';
import { QuarkHTMLElement } from '../../quark-element';
import { RedditLink } from '../../../main/api/reddit-types';
import * as utils from '../../utils';

interface PostConstructor
{
	link: RedditLink;
	readyForFullLoad: Promise<void>;
}

interface PostArguments
{
	tag?: string;
	constructor: PostConstructor;
	component: 'post';
	element: any;
}

export class Post extends quark.Component
{
	
	#QuarkData = class
	{
		#element: QuarkHTMLElement;
		#voting?: QuarkHTMLElement;
		#link: RedditLink;

		get upvoted(): boolean
		{
			if (this.#voting != null)
			{
				return this.#voting.quark.upvoted;
			} else this.#panic();
			return false;
		}

		public upvote(): void
		{
			if (this.#voting != null)
			{
				this.#voting.quark.upvote();
			} else this.#panic();
		}

		public unupvote(): void
		{
			if (this.#voting != null)
			{
				this.#voting.quark.unupvote();
			} else this.#panic();
		}

		get downvoted(): boolean
		{
			if (this.#voting != null)
			{
				return this.#voting.quark.downvoted;
			} else this.#panic();
			return false;
		}

		public downvote(): void
		{
			if (this.#voting != null)
			{
				this.#voting.quark.downvote();
			} else this.#panic();
		}

		public undownvote(): void
		{
			if (this.#voting != null)
			{
				this.#voting.quark.undownvote();
			} else this.#panic();
		}

		#panic = (): void =>
		{
			this.#element.remove();
			console.log('A PostVoting component lacks one or more of its required components, and as such can no longer function. The component will be removed.');
		}

		constructor(el: QuarkHTMLElement, link: RedditLink)
		{
			this.#element = el;
			this.#link = link;
			const postVoting: HTMLElement|null = this.#element.querySelector('.r-sharp-post__left .r-sharp-post__voting');
			if (postVoting != null)
			{
				this.#voting = <QuarkHTMLElement>postVoting;
			} else this.#panic();
		}
	}

	constructor(el: QuarkHTMLElement, args: PostArguments)
	{
		super(el, args);

		const postContainer: HTMLDivElement = document.createElement('div');
		postContainer.classList.add('r-sharp-post');
		
		const postLeft: HTMLDivElement = document.createElement('div');
		postLeft.classList.add('r-sharp-post__left');

		const postVoting: HTMLDivElement = document.createElement('div');
		postVoting.classList.add('r-sharp-post__voting');
		quark.replace
		(
			postVoting,
			{
				component: 'post__voting',
				constructor: { link: args.constructor.link, post: el },
				element: {}
			}
		);
		postLeft.appendChild(postVoting);

		postContainer.appendChild(postLeft);

		const postRight: HTMLDivElement = document.createElement('div');
		postRight.classList.add('r-sharp-post__right');

		const postHeader: HTMLDivElement = document.createElement('div');
		postHeader.classList.add('r-sharp-post__header');
		quark.replace
		(
			postHeader,
			{
				component: 'post__header',
				constructor: { link: args.constructor.link },
				element: {},
			}
		);
		postRight.appendChild(postHeader);

		const postPreview: HTMLDivElement = document.createElement('div');
		postPreview.classList.add('r-sharp-post__preview');
		quark.replace
		(
			postPreview,
			{
				component: 'post__preview',
				constructor: { link: args.constructor.link, readyForFullLoad: args.constructor.readyForFullLoad },
				element: {}
			}
		);
		postRight.appendChild(postPreview);

		const postButtons: HTMLDivElement = document.createElement('div');
		postButtons.classList.add('r-sharp-post__buttons');
		quark.replace
		(
			postButtons,
			{
				component: 'post__buttons',
				constructor: { link: args.constructor.link },
				element: {}
			}
		);
		postRight.appendChild(postButtons);

		postContainer.appendChild(postRight);

		el.appendChild(postContainer);

		el.quark = new this.#QuarkData(el, args.constructor.link);
	}

}

interface PostVotingConstructor extends PostConstructor
{
	post: QuarkHTMLElement;
}

interface PostVotingArguments extends PostArguments
{
	constructor: PostVotingConstructor;
}

export class PostVoting extends quark.Component
{
	#QuarkData = class
	{
		#element: QuarkHTMLElement;
		#link: RedditLink;
		#post: QuarkHTMLElement;
		#upvoted: boolean = false;
		#downvoted: boolean = false;

		get upvoted(): boolean { return this.#upvoted; }
		
		public upvote(): void
		{
			if (!this.#upvoted)
			{
				if (this.#downvoted) this.#link.ups++;
				this.#link.ups++;
				const votingNumbers: HTMLElement|null = this.#element.querySelector('.r-sharp-voting__text');
				if (votingNumbers != null)
				{
					votingNumbers.innerHTML = utils.prettyNumber(this.#link.ups);
					this.#upvoted = true;
					this.#downvoted = false;
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
					votingNumbers.innerHTML = utils.prettyNumber(this.#link.ups);
					this.#upvoted = false;
					this.#downvoted = false;
				} else this.#panic();
			}
		}

		get downvoted(): boolean { return this.#downvoted; }

		public downvote(): void
		{
			if (!this.#downvoted)
			{
				if (this.#upvoted) this.#link.ups--;
				const votingNumbers: HTMLElement|null = this.#element.querySelector('.r-sharp-voting__text');
				if (votingNumbers != null)
				{
					votingNumbers.innerHTML = utils.prettyNumber(this.#link.ups);
					this.#upvoted = false;
					this.#downvoted = true;
				} else this.#panic();
			}
		}

		public undownvote(): void
		{
			if (this.#downvoted)
			{
				this.#link.ups++;
				const votingNumbers: HTMLElement|null = this.#element.querySelector('.r-sharp-voting__text');
				if (votingNumbers != null)
				{
					votingNumbers.innerHTML = utils.prettyNumber(this.#link.ups);
					this.#upvoted = false;
					this.#downvoted = false;
				} else this.#panic();
			}
		}

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
		}
	}

	constructor(el: QuarkHTMLElement, args: PostVotingArguments)
	{
		super(el, args);

		const votingContainer: HTMLElement = document.createElement('div');
		votingContainer.classList.add('r-sharp-voting');
		
		quark.append
		(
			votingContainer,
			{
				tag: 'div',
				component: 'upvote-button',
				constructor: { post: args.constructor.post },
				element: {}
			}
		);

		const votingNumbers: HTMLElement = document.createElement('div');
		votingNumbers.classList.add('r-sharp-voting__text');
		votingNumbers.innerHTML = utils.prettyNumber(args.constructor.link.ups);
		votingContainer.appendChild(votingNumbers);
		
		/* quark.append
		(
			votingContainer,
			{
				tag: 'div',
				component: 'downvote-button',
				constructor: { post: args.constructor.post },
				element: {}
			}
		); */

		el.appendChild(votingContainer);

		el.quark = new this.#QuarkData(el, args.constructor.link, args.constructor.post);
	}
}

export class PostHeader extends quark.Component
{
	constructor(el: QuarkHTMLElement, args: PostArguments)
	{
		super(el, args);

		el.innerHTML +=
			`<div class="r-sharp-post__header__via">${
			'\n\t'}<div class="r-sharp-post__header__via__subreddit">${
			'\n\t\t'}${args.constructor.link.subreddit_name_prefixed}${
			'\n\t'}</div>${
			'\n\t'}<div class="r-sharp-post__header__via__user">${
			'\n\t\t'}Posted by <span class="r-sharp-post__header__via__user-link">${
			'\n\t\t\t'}u/${args.constructor.link.author.toLowerCase()}${
			'\n\t\t'}</span>${
			'\n\t'}</div>${
			'\n'}</div>${
			'\n'}<div class="r-sharp-post__header__title">${
			'\n\t'}${args.constructor.link.title}${
			'\n'}</div>`;
	}
}

enum PostPreviewType
{
	image = 'image',
}

export class PostPreview extends quark.Component
{
	static QuarkData = class
	{
		#element: QuarkHTMLElement;
		#type: PostPreviewType;
		#args: any;
		#src?: string;
		#img?: HTMLImageElement;

		get type(): string { return this.#type; }

		get src(): string|undefined { return this.#src; }
		set src(v: string|undefined)
		{
			if (this.type === PostPreviewType.image)
			{
				if (v != null)
				{
					this.#src = v;
					if (this.#img != null)
					{
						this.#img.src = v;
						if (!this.#img.hasAttribute('loaded'))
							this.#img.addEventListener('load', (): void =>
								this.#img?.setAttribute('loaded', ''));
					}
					else this.#panic();
				}
			}
			else console.error('Attempt to set src property on non-image PostPreview component.');
		}

		#panic = (): void =>
		{
			this.#element.remove();
			console.error(utils.componentPanicMessage('PostPreview'));
		};

		constructor(el: QuarkHTMLElement, type: PostPreviewType, args: any)
		{
			this.#element = el;
			this.#type = type;
			this.#args = args;
			switch(this.#type)
			{
				case PostPreviewType.image:
					{
						this.#src = args.src;
						this.#img = <HTMLImageElement>this.#element.querySelector('.r-sharp-post__preview__img');
					}
					break;
			}
		}
	}

	constructor(el: QuarkHTMLElement, args: PostArguments)
	{
		super(el, args);

		const link: RedditLink = args.constructor.link;

		let resolveConstructComplete: () => void = (): void => {};
		const constructComplete: Promise<PostPreviewType> = new Promise((resolve: () => void): void =>
		{
			resolveConstructComplete = resolve;
		});

		const postPreviewContainer: HTMLDivElement = document.createElement('div');
		postPreviewContainer.classList.add('r-sharp-post__preview');

		if (!(link.media != null))
		{
			if (link.thumbnail != null && link.url != null)
			{
				const postPreviewImage: HTMLImageElement = document.createElement('img');
				postPreviewImage.classList.add('r-sharp-post__preview__img');
				postPreviewImage.src = link.thumbnail;
				postPreviewContainer.appendChild(postPreviewImage);

				constructComplete.then((v: PostPreviewType): void =>
				{
					el.quark = new PostPreview.QuarkData(el, PostPreviewType.image, { src: link.thumbnail } );

					args.constructor.readyForFullLoad.then((): void =>
					{
						el.quark.src = link.url;
					});
				});
			}
		}

		el.appendChild(postPreviewContainer);
		resolveConstructComplete();
	}
}
