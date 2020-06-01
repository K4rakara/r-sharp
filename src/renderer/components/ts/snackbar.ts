import url from 'url';
import path from 'path';
import quark from '@quark.js/core';
import { QuarkHTMLElement } from '../../quark-element';
import { JSONDom } from '../../utils/json-dom';

interface SnackbarConstructor
{
	color?: string;
	icon?: string;
	text: string;
	lifespan?: number;
	buttons?:
	{
		text: string;
		type: 'ok'|'custom';
		onclick?: () => void;
	}[]
}

interface SnackbarArguments
{
	tag?: string;
	component: 'snackbar';
	constructor: SnackbarConstructor;
	element: any;
}

export class Snackbar extends quark.Component
{
	private element: QuarkHTMLElement;

	private closeTimeout?: number;

	public close(): void
	{
		this.element.setAttribute('closing', '');
		this.element.addEventListener('animationend', (): void =>
		{
			this.element.remove();
		});
	}

	constructor(el: QuarkHTMLElement, args: SnackbarArguments)
	{
		super(el, args);

		this.element = el;

		el.classList.add('r-sharp-snackbar');

		if (args.constructor.color != null) el.style.cssText += `--r-sharp-snackbar__color: ${args.constructor.color}`;

		new JSONDom
		([
			{ _: 'div', $: { 'class': 'r-sharp-snackbar__split' }, '': [
				{ _: 'span', $: { 'class': 'r-sharp-snackbar__left' }, '': [
					(() => {
						if (args.constructor.icon != null)
						{
							const toReturn: any = { _: 'img', $: {} };
							if (args.constructor.icon.startsWith('file:'))
							{
								const parsed: url.Url = url.parse(window.location.href);
								if (!parsed.path?.includes('/tabs/'))
								{
									const joined: string = path.join(path.parse(parsed.path || '').dir, args.constructor.icon.replace('file:', ''));
									toReturn.$.src = `file://${joined}`;
								}
								else
								{
									const joined: string = path.join(path.parse(parsed.path || '').dir, '../../', args.constructor.icon.replace('file:', ''));
									toReturn.$.src = `file://${joined}`;
								}
							}
							else
							{
								toReturn.$.src = args.constructor.icon;
							}
							return toReturn;
						}
						else
							return '';
					})(),
					args.constructor.text
				] },
				{ _: 'span', $: { 'class': 'r-sharp-snackbar__right' } }
			] }
		]).appendTo(el);

		const snackBarRight: HTMLSpanElement|null = el.querySelector('.r-sharp-snackbar__right');

		if (snackBarRight != null && args.constructor.buttons != null)
		{
			args.constructor.buttons.forEach((button): void =>
			{
				const buttonElement: HTMLDivElement = document.createElement('div');
				buttonElement.classList.add('r-sharp-snackbar__button', 'mdc-ripple-surface');
				if (button.type === 'ok')
				{
					buttonElement.innerHTML = button.text;
					buttonElement.addEventListener('mouseup', (e: MouseEvent): void =>
					{
						if (this.closeTimeout != null) window.clearTimeout(this.closeTimeout);
						if (e.button === 0) this.close();
					});
				}
				else
				{
					buttonElement.innerHTML = button.text;
					buttonElement.addEventListener('mouseup', (e: MouseEvent): void =>
					{
						if (button.onclick != null)
							if (e.button === 0)
								button.onclick();	
					});
				}
			});
		}

		if (!args.constructor.lifespan) args.constructor.lifespan = 1500;

		const animationEnd = (): void =>
		{
			el.removeEventListener('animationend', animationEnd);
			//this.closeTimeout = window.setTimeout((): void => this.close(), args.constructor.lifespan);
		}

		el.addEventListener('animationend', animationEnd);
	}
}