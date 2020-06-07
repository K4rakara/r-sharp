import quark from '@quark.js/core';
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
								text: 'Could not save post... Please try again later.',
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
						// TODO: Open a sharing menu over top of the post.
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
