import * as Kuudere from 'kuudere';
import * as utils from '../../../utils';
import { Post } from './post';
import { PostChildConstructor } from './interfaces';
import { RedditLink } from '../../../../main/api/reddit-types';
import { MDCRipple } from '@material/ripple';

export class PostPreview extends Kuudere.Component<PostChildConstructor>
{
	#link: RedditLink;

	#content:
	{
		onMouseUp: (e: MouseEvent) => void;
		element?: Kuudere.HTMLKuudereComponent<PostPreview>;
		parent?: Kuudere.HTMLKuudereComponent<Post>;
	} =
	{
		onMouseUp: (e: MouseEvent): void =>
		{
			if (e.button === 0)
				this.#content.parent!.__props.openPostOverlay();
		}
	};

	constructor(el: Kuudere.HTMLKuudereComponent<PostPreview>, args: Kuudere.Arguments<PostChildConstructor>)
	{
		super(el, args);

		this.#content.element = el;
		this.#content.parent = args.constructor.parent;
		this.#link = args.constructor.link;

		this.#content.element.classList.add('r-sharp-post__preview');
		this.#content.element.addEventListener('mouseup', this.#content.onMouseUp);

		const { div, img } = Kuudere.WebScript.HTML();

		switch (this.#link.post_hint)
		{
			case 'image':
				if (this.#link.thumbnail.match(utils.URLMatch) != null)
				{
					MDCRipple.attachTo(
						this.#content.element.appendChild(
							div.class`r-sharp-post__preview__image-container`(
								img.class`r-sharp-post__preview__image`.src`${this.#link.thumbnail}```)));
					args.constructor.readyForFullLoad.then((): void =>
					{
						const imgContainer: HTMLDivElement = <HTMLDivElement>this.#content.element!.querySelector('.r-sharp-post__preview__image-container')!;
						imgContainer.classList.add('mdc-ripple-surface');
						const img: HTMLImageElement = this.#content.element!.querySelector('img')!;
						img.src = this.#link.url;
						img.setAttribute('loaded', '');
					});
				}
				else
				{
					this.#content.element.innerHTML += `Unsupported thumbnail type: ${this.#link.thumbnail}`;
				}
				break;
			case 'self':
				this.#content.element.appendChildren
				(
					div.class`r-sharp-post__preview__text```,
					div.class`r-sharp-post__preview__text-scrim```,
				);
				this.#content.element.querySelector('.r-sharp-post__preview__text')!.innerHTML = this.#link.selftext_html;
				this.#content.element.querySelectorAll('a').forEach((el: HTMLAnchorElement): void =>
				{
					el.outerHTML = el.outerHTML.replace('<a', '<div');
					el.classList.add('a', 'mdc-ripple-surface');
					el.setAttribute('data-target', el.getAttribute('href') || '');
					el.removeAttribute('href');
				});
				break;
			case undefined: break;
			default:
				this.#content.element.innerHTML += `Unsupported post_hint type: ${this.#link.post_hint}`;
				break;
		}
	}
}