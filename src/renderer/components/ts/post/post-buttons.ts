/*import quark from '@quark.js/core';
import { MDCRipple } from '@material/ripple';
import { PostArguments } from './post';
import { QuarkHTMLElement } from '../../../quark-element';
import { RedditLink } from '../../../../main/api/reddit-types';
import { JSONDom } from '../../../utils/json-dom';
import * as api from '../../../api';
import * as utils from '../../../utils';

export class PostButtons extends quark.Component
{
	#QuarkData = class
	{
		#element: QuarkHTMLElement;
		#link: RedditLink;
		#saveButton?: HTMLElement;
		#saveButtonIcon?: HTMLElement;

		private get saveButton(): HTMLElement
		{
			if (this.#saveButton != null)
				return this.#saveButton;
			else
				this.#panic();
			return document.createElement('div');
		}

		private get saveButtonIcon(): HTMLElement
		{
			if (this.#saveButtonIcon != null)
				return this.#saveButtonIcon;
			else
				this.#panic();
			return document.createElement('div');
		}

		public save(save: boolean = true): void
		{
			// Back up the previous state, in case the API returns an error and we need
			// to revert to an old state.
			const prevState: boolean = this.#link.saved;

			this.#link.saved = save;
			
			if (this.#link.saved)
			{
				this.saveButton.innerHTML = this.saveButton.innerHTML.replace(/Save/gm, 'Saved');
				this.#saveButtonIcon = <HTMLElement>this.saveButton.querySelector('.r-sharp-icons__save') || this.#saveButton;
				this.saveButtonIcon.setAttribute('saved', '');
			}
			else
			{
				this.saveButton.innerHTML = this.saveButton.innerHTML.replace(/Saved/gm, 'Save');
				this.#saveButtonIcon = <HTMLElement>this.saveButton.querySelector('.r-sharp-icons__save') || this.#saveButton;
				this.saveButtonIcon.removeAttribute('saved');
			}

			api.link.save(`t3_${this.#link.id}`, !this.#link.saved).then((ok: boolean): void =>
			{
				if (!ok)
				{
					this.#link.saved = prevState;

					if (this.#link.saved)
					{
						this.saveButton.innerHTML = this.saveButton.innerHTML.replace(/Save/gm, 'Saved');
						this.#saveButtonIcon = <HTMLElement>this.saveButton.querySelector('.r-sharp-icons__save') || this.#saveButton;
						this.saveButtonIcon.setAttribute('saved', '');
					}
					else
					{
						this.saveButton.innerHTML = this.saveButton.innerHTML.replace(/Saved/gm, 'Save');
						this.#saveButtonIcon = <HTMLElement>this.saveButton.querySelector('.r-sharp-icons__save') || this.#saveButton;
						this.saveButtonIcon.removeAttribute('saved');
					}
					
					if (window.ifcFrame != null)
					{
						window.ifcFrame.send
						(
							'r-sharp:create-snackbar',
							{
								text: `Could not ${(this.#link.saved) ? 'save' : 'unsave'} post... Please try again later.`,
								color: '#FF0000',
								icon: 'file:assets/snoo_facepalm.png',
							}
						);
					}
					else console.warn('An iFrame does not have an ifcFrame initialized in it! It will not be able to communicate with the root frame.');
				}
				else
				{
					if (window.ifcFrame != null)
					{
						window.ifcFrame.send
						(
							'r-sharp:create-snackbar',
							{
								text: `Post ${(this.#link.saved) ? 'saved' : 'unsaved'} successfully!`,
								color: '#0079d3',
								buttons:
								[
									{
										type: 'custom',
										text: 'undo',
										lifespan: 10000,
										onclick: (): void =>
										{	
											this.save(!save);
										},
									}
								]
							}
						)
					}
					else console.warn('An iFrame does not have an ifcFrame initialized in it! It will not be able to communicate with the root frame.');
				}
			});
		}

		public share(): void
		{
			if (window.ifcFrame != null)
			{
				window.ifcFrame.send
				(
					'r-sharp:show-share-menu',
					{
						type: `link:${this.#link.post_hint}`,
						v: this.#link,
						el: this.#element,
					}
				)
			}
			else console.warn('An iFrame does not have an ifcFrame initialized in it! It will not be able to communicate with the root frame.');
		}

		#panic = (): void =>
		{
			this.#element.remove();
			console.error(utils.componentPanicMessage('PostButtons'));
		}

		constructor(el: QuarkHTMLElement, link: RedditLink)
		{
			this.#element = el;
			this.#link = link;

			const commentButton: HTMLElement|null = this.#element.querySelector('.r-sharp-post__buttons__button.r-sharp-post__buttons__comments');
			const shareButton: HTMLElement|null = this.#element.querySelector('.r-sharp-post__buttons__button.r-sharp-post__buttons__share');
			const saveButton: HTMLElement|null = this.#element.querySelector('.r-sharp-post__buttons__button.r-sharp-post__buttons__save');
			const saveButtonIcon: HTMLElement|null = this.#element.querySelector('.r-sharp-post__buttons__button.r-sharp-post__buttons__save .r-sharp-icons__save');
			const hideButton: HTMLElement|null = this.#element.querySelector('.r-sharp-post__buttons__button.r-sharp-post__buttons__hide');
			const reportButton: HTMLElement|null = this.#element.querySelector('.r-sharp-post__buttons__button.r-sharp-post__buttons__report');
			
			if (commentButton != null
				&& shareButton != null
				&& saveButton != null
				&& saveButtonIcon != null
				&& hideButton != null
				&& reportButton != null)
			{
				this.#saveButtonIcon = saveButtonIcon;
				this.#saveButton = saveButton;

				// Make sure the save button icon is the right one.
				if (this.#link.saved)
				{
					this.saveButton.innerHTML = this.saveButton.innerHTML.replace(/Save/gm, 'Saved');
					this.#saveButtonIcon = <HTMLElement>this.saveButton.querySelector('.r-sharp-icons__save') || this.#saveButton;
					this.saveButtonIcon.setAttribute('saved', '');
				}
				else
				{
					this.saveButton.innerHTML = this.saveButton.innerHTML.replace(/Saved/gm, 'Save');
					this.#saveButtonIcon = <HTMLElement>this.saveButton.querySelector('.r-sharp-icons__save') || this.#saveButton;
					this.saveButtonIcon.removeAttribute('saved');
				}

				// Comment button interactivity.
				commentButton.addEventListener('mouseup', (e: MouseEvent): void =>
				{
					switch (e.button)
					{
						case 0:
							{
								// TODO: Open the post in a pop-up, with the comments section focused.
							}
							break;
						case 1:
							{
								// TODO: Open the post in a new tab, with the comments section focused.
							}
							break;
						case 2:
							{
								// TODO: Open a context menu with the option to open in a new tab, , with the comments section focused.
							}
						default: break;
					}
				});

				// Share button interactivity.
				shareButton.addEventListener('mouseup', (e: MouseEvent): void =>
				{
					if (e.button === 0)
					{
						this.share();
					}
				});

				// Save button interactivity.
				saveButton.addEventListener('mouseup', (e: MouseEvent): void =>
				{
					if (e.button === 0)
					{
						this.save(!this.#link.saved);
					}
				});
			}
			else this.#panic();
		}
	}

	constructor(el: QuarkHTMLElement, args: PostArguments)
	{
		super(el, args);

		new JSONDom
		([
			{ _: 'div', $: { 'class': 'r-sharp-post__buttons__button mdc-ripple-surface r-sharp-post__buttons__comments' }, '': [
				{ _: 'i', $: { 'class': 'r-sharp-icons__comment' } },
				`${utils.prettyNumber(args.constructor.link.num_comments)}`,
			] },
			{ _: 'div', $: { 'class': 'r-sharp-post__buttons__button mdc-ripple-surface r-sharp-post__buttons__share' }, '': [
				{ _: 'i', $: { 'class': 'r-sharp-icons__share' } },
				'Share',
			] },
			{ _: 'div', $: { 'class': 'r-sharp-post__buttons__button mdc-ripple-surface r-sharp-post__buttons__save' }, '': [
				{ _: 'i', $: { 'class': 'r-sharp-icons__save' } },
				'Save',
			] },
			{ _: 'div', $: { 'class': 'r-sharp-post__buttons__button mdc-ripple-surface r-sharp-post__buttons__hide' }, '': [
				{ _: 'i', $: { 'class': 'r-sharp-icons__hide' } },
				'Hide',
			] },
			{ _: 'div', $: { 'class': 'r-sharp-post__buttons__button mdc-ripple-surface r-sharp-post__buttons__report' }, '': [
				{ _: 'i', $: { 'class': 'r-sharp-icons__report' } },
				'Report',
			] },
		]).appendTo(el);

		el.querySelectorAll('.r-sharp-post__buttons__button').forEach((el: Element): void =>
		{
			MDCRipple.attachTo(el);
		});

		el.quark = new this.#QuarkData(el, args.constructor.link);
	}
}
*/

import * as Kuudere from 'kuudere';
import * as utils from '../../../utils';
import { Post } from './post';
import { PostChildConstructor } from './interfaces';
import { RedditLink } from '../../../../main/api/reddit-types';

export class PostButtons extends Kuudere.Component<PostChildConstructor>
{
	#link: RedditLink;

	#content:
	{
		buttons:
		{
			comments:
			{
				onMouseUp: (el: HTMLDivElement, e: MouseEvent) => void;
				element?: HTMLDivElement;
			};
			award:
			{
				onMouseUp: (el: HTMLDivElement, e: MouseEvent) => void;
				element?: HTMLDivElement;
			};
			share:
			{
				onMouseUp: (el: HTMLDivElement, e: MouseEvent) => void;
				element?: HTMLDivElement;
			};
			save:
			{
				icon:
				{
					element?: HTMLElement;
				};
				onMouseUp: (el: HTMLDivElement, e: MouseEvent) => void;
				element?: HTMLDivElement;
			};
		};
		parent?: Kuudere.HTMLKuudereComponent<Post>;
		element?: Kuudere.HTMLKuudereComponent<PostButtons>;
	} =
	{
		buttons:
		{
			comments:
			{
				onMouseUp: (el: HTMLDivElement, e: MouseEvent): void =>
					{ if (e.button === 0) this.#content.parent!.__props.openPostOverlay(); },
			},
			award:
			{
				onMouseUp: (el: HTMLDivElement, e: MouseEvent): void =>
				{

				},
			},
			share:
			{
				onMouseUp: (el: HTMLDivElement, e: MouseEvent): void =>
				{
					if (e.button === 0)
						this.#content.parent!.__props.openShareOverlay();
				}
			},
			save:
			{
				onMouseUp: (el: HTMLDivElement, e: MouseEvent): void =>
				{
					if (e.button === 0)
						this.#content.parent!.__props.save(!this.#content.parent!.__props.saved);
				},
				icon: {},
			},
		}
	};

	public update(): void
	{
		if (this.#content.parent!.__props.saved)
		{
			this.#content.buttons.save.icon.element!.setAttribute('saved', '');
			this.#content.buttons.save.element!.innerHTML = this.#content.buttons.save.element!.innerHTML.replace(/Save/, 'Saved');
			this.#content.buttons.save.icon.element = <HTMLElement>this.#content.element!.querySelector('.r-sharp-icons__save')!;
		}
		else
		{
			this.#content.buttons.save.icon.element!.removeAttribute('saved');
			this.#content.buttons.save.element!.innerHTML = this.#content.buttons.save.element!.innerHTML.replace(/Saved/, 'Save');
			this.#content.buttons.save.icon.element = <HTMLElement>this.#content.element!.querySelector('.r-sharp-icons__save')!;
		}
	}

	constructor(el: Kuudere.HTMLKuudereComponent<PostButtons>, args: Kuudere.Arguments<PostChildConstructor>)
	{
		super(el, args);

		this.#content.element = el;
		this.#content.parent = args.constructor.parent;
		this.#link = args.constructor.link;

		this.#content.element.classList.add('r-sharp-post__buttons');

		const { div, i } = Kuudere.WebScript.HTML();

		this.#content.element.appendChildren
		(
			div
				.class`r-sharp-post__buttons__button mdc-ripple-surface`
				.$listeners({ 'mouseup': this.#content.buttons.comments.onMouseUp })(
					i.class`r-sharp-icons__comment```,
					`${this.#link.num_comments}`),
			div
				.class`r-sharp-post__buttons__button mdc-ripple-surface`
				.$listeners({ 'mouseup': this.#content.buttons.award.onMouseUp })(
					i.class`r-sharp-icons__give-award`,
					'Award'),
			div
				.class`r-sharp-post__buttons__button mdc-ripple-surface`
				.$listeners({ 'mouseup': this.#content.buttons.share.onMouseUp })(
					i.class`r-sharp-icons__share```,
					'Share'),
			div
				.class`r-sharp-post__buttons__button mdc-ripple-surface r-sharp-post__buttons__save`
				.$listeners({ 'mouseup': this.#content.buttons.save.onMouseUp })(
					i.class`r-sharp-icons__save```,
					((this.#link.saved) ? 'Saved' : 'Save')),
			div.class`r-sharp-post__buttons__button mdc-ripple-surface`(
				i.class`r-sharp-icons__hide```,
				'Hide'),
			div.class`r-sharp-post__buttons__button mdc-ripple-surface`(
				i.class`r-sharp-icons__report```,
				'Report'),
		);
		
		if (this.#link.saved)
			this.#content.element.querySelector('.r-sharp-post__buttons__save i')!.setAttribute('saved', '');
	
		this.#content.buttons.comments.element = <HTMLDivElement>this.#content.element.querySelector('.r-sharp-post__buttons__button:nth-child(1)')!;
		this.#content.buttons.award.element = <HTMLDivElement>this.#content.element.querySelector('.r-sharp-post__buttons__button:nth-child(2)')!;
		this.#content.buttons.share.element = <HTMLDivElement>this.#content.element.querySelector('.r-sharp-post__buttons__button:nth-child(3)')!;
		this.#content.buttons.save.element = <HTMLDivElement>this.#content.element.querySelector('.r-sharp-post__buttons__button:nth-child(4)')!;
		this.#content.buttons.save.icon.element = <HTMLElement>this.#content.element.querySelector('.r-sharp-icons__save')!;
	}
}