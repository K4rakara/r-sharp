import * as Kuudere from 'kuudere';
import * as utils from '../../../utils'; utils.element._;
import { RedditLink } from '../../../../main/api/reddit-types';
import { MDCRipple } from '@material/ripple';
import { ipcRenderer, clipboard, nativeImage, IpcRendererEvent } from 'electron';
import { redditUrl } from '../../../../consts';
import { Snackbar } from '../snackbar';
import { QuarkHTMLElement } from '../../../quark-element';
import { Post } from '../post';

interface ShareMenuConstructor
{
	type: string;
	link: RedditLink;
	post: Kuudere.HTMLKuudereComponent<Post>;
}

export class ShareMenu extends Kuudere.Component<ShareMenuConstructor>
{
	#element: Kuudere.HTMLKuudereComponent<ShareMenu>;

	#postElement: Kuudere.HTMLKuudereComponent<Post>;

	#type: string;

	#link: RedditLink;

	#scrim:
	{
		onClick: (el: HTMLDivElement, e: MouseEvent) => void;
		element?: HTMLDivElement;
	} =
	{
		onClick: (el: HTMLDivElement, e: MouseEvent): void =>
			{ if (e.button === 0) this.close(); }
	};

	#main:
	{
		close:
		{
			onMouseUp: (el: HTMLDivElement, e: MouseEvent) => void;
			element?: HTMLDivElement;
		},
		buttons:
		{
			copyLinkUrl:
			{
				onMouseUp: (el: HTMLDivElement, e: MouseEvent) => void;
				element?: HTMLDivElement;
			};
			copyImage:
			{
				onMouseUp: (el: HTMLDivElement, e: MouseEvent) => void;
				element?: HTMLDivElement;
			};
			copyImageUrl:
			{
				onMouseUp: (el: HTMLDivElement, e: MouseEvent) => void;
				element?: HTMLDivElement;
			};
			saveImage:
			{
				onMouseUp: (el: HTMLDivElement, e: MouseEvent) => void;
				element?: HTMLDivElement;
			};
			save:
			{
				onMouseUp: (el: HTMLDivElement, e: MouseEvent) => void;
				element?: HTMLDivElement;
			}
		}
		element?: HTMLDivElement;
	} = 
	{
		close: { onMouseUp: (el: HTMLDivElement, e: MouseEvent): void => { if (e.button === 0) this.close(); } },
		buttons:
		{
			copyLinkUrl: { onMouseUp: (el: HTMLDivElement, e: MouseEvent): void => { if (e.button === 0) this.copyLinkUrl(); this.close(); } },
			copyImage: { onMouseUp: (el: HTMLDivElement, e: MouseEvent): void => { if (e.button === 0) this.copyImage(); } },
			copyImageUrl: { onMouseUp: (el: HTMLDivElement, e: MouseEvent): void => { if (e.button === 0) this.copyImageUrl(); this.close(); } },
			saveImage: { onMouseUp: (el: HTMLDivElement, e: MouseEvent): void => { if (e.button === 0) this.saveImage(); } },
			save: { onMouseUp: (el: HTMLDivElement, e: MouseEvent): void => { if (e.button === 0) this.toggleSave(); this.close(); } },
		}
	};

	public getLinkUrl(): string
	{
		if (this.#type === 'link:image') return `${redditUrl}${this.#link.permalink}`;
		else this.#warnIncompatibility('link:image', this.#type);
		return '';
	}

	public copyLinkUrl(): void { clipboard.writeText(this.getLinkUrl()); }

	public getImageUrl(): string
	{
		if (this.#type === 'link:image') return this.#link.url;
		else this.#warnIncompatibility('link:image', this.#type);
		return '';
	}

	public copyImageUrl(): void { clipboard.writeText(this.getImageUrl()); }

	public async copyImage(): Promise<void>
	{
		if (this.#type === 'link:image')
		{
			const arr: ArrayBuffer = await (await fetch(this.#link.url)).arrayBuffer();
			clipboard.writeImage(nativeImage.createFromBuffer(Buffer.from(arr)));
			this.close();	
		}
		else this.#warnIncompatibility('link:image', this.#type);
	}

	public async saveImage(): Promise<void>
	{
		if (this.#type === 'link:image')
		{
			const success: boolean = await new Promise((resolve: (success: boolean) => void): void =>
			{
				ipcRenderer.once
				(
					'reply:r-sharp:io:save-image-from-url',
					(e: IpcRendererEvent, success: boolean): void => resolve(success)
				);
				ipcRenderer.send('r-sharp:io:save-image-from-url', this.getImageUrl());
			});
			if (window.rSharp != null)
			{
				if (success)
				{
					window.rSharp.snackbars.appendChild
					(
						Kuudere.constructComponent
						(
							'div',
							Snackbar,
							{
								constructor:
								{
									text: `Image saved successfully!`,
									color: `#0079d3`,
									icon: `file:assets/snoo_smile.png`,
								}
							}
						)
					);
				}
				else
				{
					window.rSharp.snackbars.appendChild
					(
						Kuudere.constructComponent
						(
							'div',
							Snackbar,
							{
								constructor:
								{
									text: `Failed to save image...`,
									color: `#EA0027`,
									icon: `file:assets/snoo_facepalm.png`,
								}
							}
						)
					);
				}
			}
			this.close();
		}
	}

	public toggleSave(): void
	{
		this.#postElement.__props.save(!this.#link.saved);
	}

	public close(): void
	{
		this.#element.removeAttribute('opened');
		window.setTimeout((): void =>
		{
			this.#element.removeAttribute('visible');
			this.#element.remove();
		}, 500);
	}

	#warnIncompatibility = (intended: string, got: string): string => `[ShareMenu]: A method intended for use on ${intended} share menus was used on a ${got} share menu.`;

	constructor(el: Kuudere.HTMLKuudereComponent<ShareMenu>, args: Kuudere.Arguments<ShareMenuConstructor>)
	{
		super(el, args);

		this.#element = el;
		this.#postElement = args.constructor.post;
		this.#type = args.constructor.type;
		this.#link = args.constructor.link;

		el.classList.add('r-sharp-share-menu');
		el.setAttribute('visible', '');

		const { div, i } = Kuudere.WebScript.HTML();
		const { svg, path } = Kuudere.WebScript.SVG();

		el.appendChildren
		(
			div
				.class`r-sharp-share-menu__scrim r-sharp-scrim`
				.$listeners({ 'click': this.#scrim.onClick })(),
			div.class`r-sharp-share-menu__main`(
				div
					.class`r-sharp-share-menu__close mdc-ripple-surface`
					.$listeners({ 'mouseup': this.#main.close.onMouseUp })(
						i.class`r-sharp-icons__dismiss`),
				div.class`r-sharp-share-menu__label`('Share post'))
		);

		const scrim: HTMLDivElement = <HTMLDivElement>el.querySelector('.r-sharp-share-menu__scrim')!;
		this.#scrim.element = scrim;
		const main: HTMLDivElement = <HTMLDivElement>el.querySelector('.r-sharp-share-menu__main')!;
		this.#main.element = main;

		switch (args.constructor.type)
		{
			case 'link:image':
				{
					main.appendChildren
					(
						div
							.class`r-sharp-share-menu__button mdc-ripple-surface`
							.$listeners({ 'mouseup': this.#main.buttons.copyLinkUrl.onMouseUp })(
								svg.viewBox`0 0 24 24`(
									path.d`M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z`),
								div.class`r-sharp-share-menu__button__text``Copy link`),
						div
							.class`r-sharp-share-menu__button mdc-ripple-surface`
							.$listeners({ 'mouseup': this.#main.buttons.copyImage.onMouseUp })(
								svg.viewBox`0 0 24 24`(
									path.d`M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z`),
								div.class`r-sharp-share-menu__button__text``Copy image`),
						div
							.class`r-sharp-share-menu__button mdc-ripple-surface`
							.$listeners({ 'mouseup': this.#main.buttons.copyImageUrl.onMouseUp })(
								svg.viewBox`0 0 24 24`(
									path.d`M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z`),
								div.class`r-sharp-share-menu__button__text``Copy image link`),
						div
							.class`r-sharp-share-menu__button mdc-ripple-surface`
							.$listeners({ 'mouseup': this.#main.buttons.saveImage.onMouseUp })(
								svg.viewBox`0 0 24 24`(
									path.d`M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z`),
								div.class`r-sharp-share-menu__button__text``Save image`),
						div
							.class`r-sharp-share-menu__button mdc-ripple-surface`
							.$listeners({ 'mouseup': this.#main.buttons.save.onMouseUp })(
								i.class`r-sharp-icons__save`,
								div.class`r-sharp-share-menu__button__text``${(this.#link.saved) ? 'Unsave' : 'Save' } post`),
						div
							.class`r-sharp-share-menu__button mdc-ripple-surface`
							.$listeners({})(
								svg.viewBox`0 0 20 20`(
									path.d`M10,0A10,10,0,0,0,1.64,15.51L.57,18.73c-.16.52.19.86.7.7l3.22-1.08A10,10,0,1,0,10,0ZM5.54,11.41A1.39,1.39,0,1,1,6.93,10,1.39,1.39,0,0,1,5.54,11.41Zm4.46,0A1.39,1.39,0,1,1,11.39,10,1.39,1.39,0,0,1,10,11.41Zm4.44,0A1.39,1.39,0,1,1,15.83,10,1.39,1.39,0,0,1,14.44,11.41Z`),
								div.class`r-sharp-share-menu__button__text``Share to chat`)
					);
					if (this.#link.saved)
						this.#element.querySelector('.r-sharp-icons__save')!.setAttribute('saved', '');
				}
				break;
		}

		// Apply the ripple effect.
		{
			const ripples: HTMLElement[] = Array.from(el.querySelectorAll('.mdc-ripple-surface'));
			ripples.forEach((ripple: HTMLElement): void =>
				{ MDCRipple.attachTo(ripple); });
		}

		window.setTimeout((): void => this.#element.setAttribute('opened', ''), 100);
	}
}
