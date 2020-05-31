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
						// Back up the previous state, in case the API returns an error and we need
						// to revert to an old state.
						const prevState: boolean = this.#link.saved;

						this.#link.saved = !this.#link.saved;
						
						if (this.#link.saved) saveButtonIcon.setAttribute('saved', '');
						else saveButtonIcon.removeAttribute('saved');

						api.link.save(`t3_${this.#link.id}`, !this.#link.saved).then((ok: boolean): void =>
						{
							if (!ok)
							{
								this.#link.saved = prevState;

								if (this.#link.saved) saveButtonIcon.setAttribute('saved', '');
								else saveButtonIcon.removeAttribute('saved');
								
								// TODO: Add a "Could not save post" snackbar message.
							}
							else
							{
								// TODO: Add a "post saved successfully" snackbar message.
							}
						});
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
