import * as Kuudere from 'kuudere';
import * as utils from '../../../utils';
import { Post } from './post';
import { PostChildConstructor } from './interfaces';
import { RedditLink } from '../../../../main/api/reddit-types';
import { MDCRipple } from '@material/ripple';

enum PostPreviewType
{
	image,
	text,
	none,
}

export class PostPreview extends Kuudere.Component<PostChildConstructor>
{
	#link: RedditLink;

	#type: PostPreviewType = PostPreviewType.none;

	#isFull: boolean = false;

	#content:
	{
		onMouseUp: (e: MouseEvent) => void;
		onMouseDown: (e: MouseEvent) => void;
		onMouseMove: (e: MouseEvent) => void;
		onMouseOut: (e: MouseEvent) => void;
		image:
		{
			top: number;
			left: number;
			scale: number;
			update: () => void;
			imageButtons:
			{
				reset:
				{
					onMouseUp: (el: HTMLDivElement, e: MouseEvent) => void;
					element?: HTMLDivElement;
				};
				zoomIn:
				{
					onMouseUp: (el: HTMLDivElement, e: MouseEvent) => void;
					element?: HTMLDivElement;
				};
				zoomOut:
				{
					onMouseUp: (el: HTMLDivElement, e: MouseEvent) => void;
					element?: HTMLDivElement;
				};
				element?: HTMLDivElement;
			};
			element?: HTMLImageElement;
		};
		element?: Kuudere.HTMLKuudereComponent<PostPreview>;
		parent?: Kuudere.HTMLKuudereComponent<Post>;
	} =
	{
		onMouseDown: (e: MouseEvent): void =>
		{
			if (e.button === 0)
			{
				if (this.#isFull && this.#type === PostPreviewType.image)
				{
					if (this.#content.image.scale >= 1.25)
					{
						this.#content.element!.addEventListener('mousemove', this.#content.onMouseMove);
					}
				}
			}
		},
		onMouseUp: (e: MouseEvent): void =>
		{
			if (this.#isFull)
			{
				switch (this.#type)
				{
					case PostPreviewType.image:
						this.#content.element!.removeEventListener('mousemove', this.#content.onMouseMove);
						break;
				}
			}
			else
			{
				if (e.button === 0) this.#content.parent!.__props.openPostOverlay();
			}
		},
		onMouseMove: (e: MouseEvent): void =>
		{
			if (this.#isFull && this.#type == PostPreviewType.image)
			{
				const image = this.#content.image;
				image.top += e.movementX;
				image.left += e.movementY;
				image.update();
			}
			else
				this.#content.element!.removeEventListener('mousemove', this.#content.onMouseMove);
		},
		onMouseOut: (e: MouseEvent): void =>
		{
			this.#content.element!.removeEventListener('mousemove', this.#content.onMouseMove);
		},
		image:
		{
			top: 0,
			left: 0,
			scale: 1,
			update: (): void =>
			{
				const image = this.#content.image;
				const el: HTMLImageElement|undefined = image.element;
				if (!(el != null)) return;
				if (image.scale >= 1.25) el.parentElement!.setAttribute('zoomed', '');
				else
				{
					el.parentElement!.removeAttribute('zoomed');
					image.top = 0;
					image.left = 0;
				}
				el.style.transform = `scale(${image.scale}) translate(${image.top}px, ${image.left}px)`;
			},
			imageButtons:
			{
				reset:
				{
					onMouseUp: (el: HTMLDivElement, e: MouseEvent): void =>
					{
						const image = this.#content.image;
						image.scale = 1;
						image.left = 0;
						image.top = 0;
						image.update();
					},
				},
				zoomIn:
				{
					onMouseUp: (el: HTMLDivElement, e: MouseEvent): void =>
					{
						const image = this.#content.image;
						if (image.scale < 4) image.scale += 0.25;
						image.update();
					},
				},
				zoomOut:
				{
					onMouseUp: (el: HTMLDivElement, e: MouseEvent): void =>
					{
						const image = this.#content.image;
						if (image.scale > 1) image.scale -= 0.25;
						image.update();
					},
				},
			},
		}
	};

	constructor(el: Kuudere.HTMLKuudereComponent<PostPreview>, args: Kuudere.Arguments<PostChildConstructor>)
	{
		super(el, args);

		this.#content.element = el;
		this.#content.parent = args.constructor.parent;
		if (this.#content.parent.hasAttribute('full')) this.#isFull = true;
		this.#link = args.constructor.link;

		this.#content.element.classList.add('r-sharp-post__preview');
		this.#content.element.addEventListener('mousedown', this.#content.onMouseDown);
		this.#content.element.addEventListener('mouseup', this.#content.onMouseUp);
		this.#content.element.addEventListener('mouseout', this.#content.onMouseOut);

		const { div, img } = Kuudere.WebScript.HTML();
		const { svg, path } = Kuudere.WebScript.SVG();

		switch (this.#link.post_hint)
		{
			case 'image':
				if (this.#link.thumbnail.match(utils.URLMatch) != null)
				{
					this.#type = PostPreviewType.image;
					
					const appended = this.#content.element.appendChild(
						div.class`r-sharp-post__preview__image-container`(
							img
								.class`r-sharp-post__preview__image`
								.src`${this.#link.thumbnail}`
								.draggable`false```));
					
					if (this.#isFull)
					{
						const imageButtons = this.#content.image.imageButtons;
						imageButtons.element = this.#content.element.appendChild(
							div.class`r-sharp-post__preview__image-buttons`(
								div
									.class`r-sharp-post__preview__image-buttons__button mdc-ripple-surface`
									.$listeners({ 'mouseup': this.#content.image.imageButtons.reset.onMouseUp })
									`Reset`,
								div
									.class`r-sharp-post__preview__image-buttons__button mdc-ripple-surface`
									.$listeners({ 'mouseup': this.#content.image.imageButtons.zoomIn.onMouseUp })(
										svg.viewBox`0 0 24 24`(
											path.d`M9,2A7,7 0 0,1 16,9C16,10.57 15.5,12 14.61,13.19L15.41,14H16L22,20L20,22L14,16V15.41L13.19,14.61C12,15.5 10.57,16 9,16A7,7 0 0,1 2,9A7,7 0 0,1 9,2M8,5V8H5V10H8V13H10V10H13V8H10V5H8Z```)),
								div
									.class`r-sharp-post__preview__image-buttons__button mdc-ripple-surface`
									.$listeners({ 'mouseup': this.#content.image.imageButtons.zoomOut.onMouseUp })(
										svg.viewBox`0 0 24 24`(
											path.d`M9,2A7,7 0 0,1 16,9C16,10.57 15.5,12 14.61,13.19L15.41,14H16L22,20L20,22L14,16V15.41L13.19,14.61C12,15.5 10.57,16 9,16A7,7 0 0,1 2,9A7,7 0 0,1 9,2M5,8V10H13V8H5Z`))));
						imageButtons.reset.element = <HTMLDivElement>imageButtons.element!.querySelector('.r-sharp-post__preview__image-buttons__button:nth-child(1)');
						imageButtons.zoomIn.element = <HTMLDivElement>imageButtons.element!.querySelector('.r-sharp-post__preview__image-buttons__button:nth-child(2)');
						imageButtons.zoomOut.element = <HTMLDivElement>imageButtons.element!.querySelector('.r-sharp-post__preview__image-buttons__button:nth-child(3)');
					}
					else
						MDCRipple.attachTo(appended);
					
					this.#content.image.element = <HTMLImageElement>this.#content.element.querySelector('.r-sharp-post__preview__image')!;
					args.constructor.readyForFullLoad.then((): void =>
					{
						const imgContainer: HTMLDivElement = <HTMLDivElement>this.#content.element!.querySelector('.r-sharp-post__preview__image-container')!;
						if (!this.#isFull) imgContainer.classList.add('mdc-ripple-surface');
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