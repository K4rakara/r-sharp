import quark from '@quark.js/core';
import { PostArguments } from './post';
import { QuarkHTMLElement } from '../../../quark-element';
import { RedditLink } from '../../../../main/api/reddit-types';
import * as utils from '../../../utils';
import { JSONDom } from '../../../utils/json-dom';

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

		switch (link.post_hint)
		{
			case 'image':
				{
					if (link.thumbnail.match(utils.URLMatch) != null)
					{
						new JSONDom([ { _: 'img', $: { 'class': 'r-sharp-post__preview__img', 'src': link.thumbnail } } ]).appendTo(postPreviewContainer);

						constructComplete.then((v: PostPreviewType): void =>
						{
							el.quark = new PostPreview.QuarkData(el, PostPreviewType.image, { src: link.thumbnail } );

							args.constructor.readyForFullLoad.then((): void =>
							{
								el.quark.src = link.url;
							});
						});
					}
					else
					{
						
					}
				}
				break;
			case 'hosted:video':
				{
					postPreviewContainer.innerHTML += 'Videos are not yet supported'
				}
				break;
			case 'rich:video':
				{

				}
				break;
			case 'self':
				{
					new JSONDom
					([
						{ _: 'div', $: { 'class': 'r-sharp-post__preview__text' }, '': [ link.selftext_html, ] },
						{ _: 'div', $: { 'class': 'r-sharp-post__preview__text-scrim' } },
					]).appendTo(postPreviewContainer);
					args.constructor.readyForFullLoad.then((): void =>
						{ el.style.width = `${el.parentElement?.clientWidth}px` || el.style.width; });
				}
				break;
			default:
				{
					console.warn(`A PostPreview component encountered an unknown preview type: ${link.post_hint}`);
					postPreviewContainer.innerHTML += `An error occurred.`;
				}
				break;
		}

		/*
		if (!(link.media != null))
		{
			
			
			if (link.thumbnail != null && link.url != null)
			{
				if (link.thumbnail !== "self" && link.thumbnail !== 'default')
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
				else
				{
					if (link.thumbnail === 'self')
					{
						new JSONDom
						([
							{ _: 'div', $: { 'class': 'r-sharp-post__preview__text' }, '': [
								args.constructor.link.selftext_html
							] },
							{ _: 'div', $: { 'class': 'r-sharp-post__preview__text-scrim' } }
						]).appendTo(postPreviewContainer);
					}
				}
			}
		}*/

		el.appendChild(postPreviewContainer);
		resolveConstructComplete();
	}
}