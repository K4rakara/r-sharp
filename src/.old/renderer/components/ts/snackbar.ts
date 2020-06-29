import url from 'url';
import path from 'path';
import * as Kuudere from 'kuudere';
import * as utils from '../../utils'; utils.element._;
import { MDCRipple } from '@material/ripple';

interface SnackbarConstructor
{
	color?: string;
	icon?: string;
	text: string;
	lifespan?: number;
	buttons?:
	{
		text: string;
		onclick?: () => void;
	}[]
}

export class Snackbar extends Kuudere.Component<SnackbarConstructor>
{
	#element: Kuudere.HTMLKuudereComponent<Snackbar>;

	#left:
	{
		onMouseUp: (el: HTMLDivElement, e: MouseEvent) => void;
		onMouseOver: (el: HTMLDivElement, e: MouseEvent) => void;
		onMouseOut: (el: HTMLDivElement, e: MouseEvent) => void;
		element?: HTMLDivElement;
	} =
	{
		onMouseUp: (el: HTMLDivElement, e: MouseEvent): void =>
			{ if (e.button === 0) this.close(); },
		onMouseOver: (): void =>
		{
			if (this.#left.element != null) this.#left.element.style.width = '2em';
			else this.#panic();
			if (this.#right.element != null)
			{
				this.#right.element.style.width = 'calc(100% - 2em)';
				this.#right.element.style.left = '2em';
			}
			else this.#panic();
		},
		onMouseOut: (): void =>
		{
			if (this.#left.element != null) this.#left.element.style.width = '1em';
			else this.#panic();
			if (this.#right.element != null)
			{
				this.#right.element.style.width = 'calc(100% - 1em)';
				this.#right.element.style.left = '1em';
			}
			else this.#panic();
		}
	};

	#right:
	{
		split:
		{
			left: { element?: HTMLDivElement; };
			right:
			{
				buttons: HTMLDivElement[];
				element?: HTMLDivElement;
			};
			element?: HTMLDivElement;
		};
		element?: HTMLDivElement;
	} =
	{
		split:
		{
			left: {},
			right: { buttons: [], },
		},
	};

	#timeout?: number;

	public get text(): string
	{
		if (this.#right.split.left.element != null) return this.#right.split.left.element.innerText;
		else this.#panic();
		return '';
	}

	public set text(v: string)
	{
		if (this.#right.split.left.element != null)
			this.#right.split.left.element.innerHTML = this.#right.split.left.element.innerHTML.replace(this.#right.split.left.element.innerText, v);
		else this.#panic();
	}

	public close(): void
	{
		if (this.#element != null)
		{
			if (this.#timeout != null) window.clearTimeout(this.#timeout);
			this.#element.setAttribute('closing', '');
			this.#element.addEventListener('animationend', (): void => this.#element.remove());
		}
	}

	#panic = (): void =>
	{
		this.#element.remove();
		console.error(utils.componentPanicMessage('Snackbar'));
	};

	constructor(el: Kuudere.HTMLKuudereComponent<Snackbar>, args: Kuudere.Arguments<SnackbarConstructor>)
	{
		super(el, args);

		el.classList.add('r-sharp-snackbar');
		el.setAttribute('opening', '');

		this.#element = el;

		if (args.constructor.color != null) el.style.setProperty('--r-sharp-snackbar__color', args.constructor.color);

		const { div, img, i } = Kuudere.WebScript.HTML();

		el.appendChildren
		(
			div
				.class`r-sharp-snackbar__left mdc-ripple-surface`
				.$listeners({
					'mouseup': this.#left.onMouseUp,
					'mouseover': this.#left.onMouseOver,
					'mouseout': this.#left.onMouseOut,
				})(
					i.class`r-sharp-icons__dismiss`),
			div.class`r-sharp-snackbar__right`(
				div.class`r-sharp-snackbar__split`(
					div.class`r-sharp-snackbar__split__left`(),
					div.class`r-sharp-snackbar__split__right`()))
		);

		// Set some references to HTML elements.
		this.#left.element = <HTMLDivElement>el.querySelector('.r-sharp-snackbar__left')!;
		this.#right.element = <HTMLDivElement>el.querySelector('.r-sharp-snackbar__right')!;
		this.#right.split.element = <HTMLDivElement>this.#right.element!.querySelector('.r-sharp-snackbar__split')!;
		this.#right.split.left.element = <HTMLDivElement>this.#right.split.element!.querySelector('.r-sharp-snackbar__split__left')!;
		this.#right.split.right.element = <HTMLDivElement>this.#right.split.element!.querySelector('.r-sharp-snackbar__split__right')!;

		// Create an icon if one was specified.
		if (args.constructor.icon != null)
		{
			let toAppend: HTMLElement;
			if (args.constructor.icon.startsWith('file:'))
			{
				const parsed: url.Url = url.parse(window.location.href);
				if (!parsed.path!.includes('/tabs/'))
				{
					const joined: string = path.join(path.parse(parsed.path || '').dir, args.constructor.icon.replace('file:', ''));
					toAppend = img.src`file://${joined}`();
				}
				else
				{
					const joined: string = path.join(path.parse(parsed.path || '').dir, '../../', args.constructor.icon.replace('file:', ''));
					toAppend = img.src`file://${joined}`();
				}
			}
			else toAppend = img.src`${args.constructor.icon}`();
			this.#right.split.left.element!.appendChild(toAppend);
		}

		// Append the text to the snackbar, now that the image has been appended.
		this.#right.split.left.element!.innerHTML += args.constructor.text;

		// Create buttons.
		if (args.constructor.buttons != null)
		{
			args.constructor.buttons.forEach((button): void =>
			{
				this.#right.split.right.buttons.push
				(
					this.#right.split.right.element!.appendChild
					(
						div
							.class`r-sharp-snackbar__button mdc-ripple-surface`
							.$listeners({
								'mouseup': (el: HTMLDivElement, e: MouseEvent): void =>
									{ if (e.button === 0 && button.onclick != null) button.onclick(); }
							})(button.text)
					)
				);
			});
		}

		// Initialize MDC ripple.
		{
			const ripples: HTMLElement[] = Array.from(el.querySelectorAll('.mdc-ripple-surface'));
			ripples.forEach((ripple: HTMLElement): void =>
				{ MDCRipple.attachTo(ripple); });
		}

		// Set a lifespan, if it wasn't passed.
		if (!(args.constructor.lifespan != null)) args.constructor.lifespan = 1500;

		const onAnimationEnd = (): void =>
		{
			el.removeAttribute('opening');
			el.removeEventListener('animationend', onAnimationEnd);
			this.#timeout = window.setTimeout((): void => this.close(), args.constructor.lifespan);
		};

		el.addEventListener('animationend', onAnimationEnd);
	}
}
