import quark from '@quark.js/core';
import { PostArguments, PostConstructor } from './post';
import { QuarkHTMLElement } from '../../../quark-element';
import { RedditVoteType } from '../../../api/link';
import { RedditLink } from '../../../../main/api/reddit-types';
import { JSONDom } from '../../../utils/json-dom';
import * as api from '../../../api';
import * as utils from '../../../utils';

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
}
