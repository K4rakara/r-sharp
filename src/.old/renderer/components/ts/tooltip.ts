import quark from '@quark.js/core';
import * as Kuudere from 'kuudere';
import { QuarkHTMLElement } from '../../quark-element';
import { componentPanicMessage } from '../../utils';
import { IfcFrame, IfcFrameEvent } from '../../tabs/ifc-frame';
import { RSharp } from '../../r-sharp';

declare global
{
	interface Window
	{
		rSharp?: RSharp;
		ifcFrame?: IfcFrame;
	}
}

interface TooltipConstructor
{
	text: string;
}

interface TooltipArguments
{
	tag?: string;
	component: 'tooltip';
	constructor: TooltipConstructor;
	element: any;
}

export class Tooltip extends quark.Component
{
	#QuarkData = class
	{
		#element: QuarkHTMLElement;
		#box?: HTMLDivElement;
		#shown: boolean = false;

		get box(): HTMLDivElement
		{
			if (this.#box != null)
				return this.#box;
			else
				this.#panic();
			return document.createElement('div');
		}

		get shown(): boolean { return this.#shown; }

		public show(): void
		{
			this.#shown = true;
			this.box.setAttribute('shown', '');
			
			setTimeout((): void => this.reposition(), 10);

			if (window.rSharp != null)
			{
				window.rSharp.tooltipQuickOpen = true;
				if (window.rSharp.tooltipStopQuickOpening != null)
				{
					window.clearTimeout(window.rSharp.tooltipStopQuickOpening);
					window.rSharp.tooltipStopQuickOpening = null;
				}
			}
			else if (window.ifcFrame != null)
			{
				window.ifcFrame.send('r-sharp:set-tooltip-quick-open', true);
				window.ifcFrame.send('r-sharp:clear-tooltip-timeout');	
			}
		}

		public hide(): void
		{
			this.#shown = false;
			this.box.removeAttribute('shown');

			if (window.rSharp != null)
			{
				if (!(window.rSharp.tooltipStopQuickOpening != null))
				{
					window.rSharp.tooltipStopQuickOpening = window.setTimeout((): void =>
					{
						(<any>window.rSharp).tooltipQuickOpen = false;
					}, 500);
				}
			}
			else if (window.ifcFrame != null)
			{
				new Promise((resolve: (v: number|null) => void): void =>
				{
					window.ifcFrame?.once
					(
						'reply:r-sharp:get-tooltip-timeout',
						(e: IfcFrameEvent, v: number|null): void => resolve(v),
					);
					window.ifcFrame?.send('r-sharp:get-tooltip-timeout');
				})
				.then((v: number|null): void =>
				{
					if (!(v != null)) window.ifcFrame?.send('r-sharp:start-tooltip-timeout');
				});
			}
		}

		public reposition(): void
		{
			this.box.style.cssText = this.box.style.cssText.replace(/left: .*?;/gm, '');
			this.box.style.cssText = this.box.style.cssText.replace(/right: .*?;/gm, '');
			this.box.style.cssText = this.box.style.cssText.replace(/float: .*?;/gm, '');
			const clientRect: DOMRect = this.box.getClientRects()[0];
			if (clientRect.x + this.box.offsetWidth >= document.documentElement.clientWidth)
				this.box.style.cssText += `right: 0; float: right;`;
			else if (clientRect.x - this.box.offsetWidth <= 0)
				this.box.style.cssText += `left: 0; float: left;`;
			else
				this.box.style.cssText += `left: calc(50% - (${this.box.offsetWidth}px / 2)); float: left;`;
		}

		#panic = (): void =>
		{
			this.#element.remove();
			console.error(componentPanicMessage('Tooltip'));
		}

		constructor(el: QuarkHTMLElement)
		{
			this.#element = el;
			const tooltipBox: HTMLDivElement|null = this.#element.querySelector('.r-sharp-tooltip__box');
			if (tooltipBox != null) this.#box = tooltipBox;
			else this.#panic();

			setTimeout(():void => this.reposition(), 10);

			let timeout: number|null = null;
			
			this.#element.addEventListener('mouseenter', (): void =>
			{
				if (window.rSharp != null)
					if (window.rSharp.tooltipQuickOpen)
						timeout = window.setTimeout((): void => this.show(), 500);
					else
						timeout = window.setTimeout((): void => this.show(), 1500);
				else if (window.ifcFrame != null)
					// A new promise is created in order to await the reply of the root frame,
					// As this component may be placed inside an iframe.
					new Promise((resolve: (v: boolean) => void): void =>
					{
						window.ifcFrame?.once
						(
							'reply:r-sharp:get-tooltip-quick-open',
							(e: IfcFrameEvent, v: boolean): void => resolve(v)
						);
						window.ifcFrame?.send('r-sharp:get-tooltip-quick-open');
					})
					.then((v: boolean): void =>
					{
						if (v) timeout = window.setTimeout((): void => this.show(), 500);
						else timeout = window.setTimeout((): void => this.show(), 1500);
					});
			});

			this.#element.addEventListener('mouseleave', (): void =>
			{
				if (timeout != null) { clearTimeout(timeout); timeout = null; }
				if (this.shown) this.hide();
			});
		}
	}

	constructor(el: QuarkHTMLElement, args: TooltipArguments)
	{
		super(el, args);

		el.classList.add('r-sharp-tooltip');
		el.innerHTML +=
			`<div class="r-sharp-tooltip__positioner">${
			'\n\t'}<div class="r-sharp-tooltip__box">${
			'\n\t\t'}${args.constructor.text}${
			'\n\t'}</div>${
			'\n'}</div>`;
		
		el.quark = new this.#QuarkData(el);
	}
}

export class Tooltip2 extends Kuudere.Component<string>
{
	#timeout: number|null = null;

	#opened: boolean = false;

	#content:
	{
		onMouseEnter: (e: MouseEvent) => void;
		onMouseLeave: (e: MouseEvent) => void;
		positioner:
		{
			box:
			{
				element?: HTMLDivElement;
			};
			element?: HTMLDivElement;
		};
		element?: Kuudere.HTMLKuudereComponent<Tooltip2>;
	} =
	{
		positioner: { box: {}, },
		onMouseEnter: (e: MouseEvent): void =>
		{
			if (window.rSharp != null)
				if (window.rSharp.tooltipQuickOpen)
					this.#timeout = window.setTimeout((): void => this.open(), 500);
				else
					this.#timeout = window.setTimeout((): void => this.open(), 1500);  
			else if (window.ifcFrame != null)
				new Promise((resolve: (v: boolean) => void): void =>
				{
					window.ifcFrame!.once
					(
						'reply:r-sharp:get-tooltip-timeout',
						(e: IfcFrameEvent, v: boolean): void =>
							resolve(v)
					);
					window.ifcFrame!.send('r-sharp:get-tooltip-timeout');
				})
				.then((v: boolean): void =>
				{
					if (v) this.#timeout = window.setTimeout((): void => this.open(), 500);
					else this.#timeout = window.setTimeout((): void => this.open(), 1500);
				});
		},
		onMouseLeave: (e: MouseEvent): void =>
		{
			if (this.#timeout != null) { window.clearTimeout(this.#timeout); this.#timeout = null; }
			if (this.#opened) this.close();
		},
	};

	public open(): void
	{
		const box = this.#content.positioner.box.element!;
		
		this.#opened = true;
		box.setAttribute('opened', '');

		window.setTimeout((): void => this.reposition(), 10);

		if (window.rSharp != null)
		{
			if (!(window.rSharp.tooltipStopQuickOpening != null))
			{
				window.rSharp.tooltipStopQuickOpening = window.setTimeout((): void =>
				{
					(<any>window.rSharp).tooltipQuickOpen = false;
				}, 500);
			}
		}
		else if (window.ifcFrame != null)
		{
			new Promise((resolve: (v: number|null) => void): void =>
			{
				window.ifcFrame?.once
				(
					'reply:r-sharp:get-tooltip-timeout',
					(e: IfcFrameEvent, v: number|null): void => resolve(v),
				);
				window.ifcFrame?.send('r-sharp:get-tooltip-timeout');
			})
			.then((v: number|null): void =>
			{
				if (!(v != null)) window.ifcFrame?.send('r-sharp:start-tooltip-timeout');
			});
		}
	}

	public close(): void
	{
		const box = this.#content.positioner.box.element!;

		this.#opened = false;
		box.removeAttribute('opened');

		if (window.rSharp != null)
		{
			if (!(window.rSharp.tooltipStopQuickOpening != null))
			{
				window.rSharp.tooltipStopQuickOpening = window.setTimeout((): void =>
				{
					(<any>window.rSharp).tooltipQuickOpen = false;
				}, 500);
			}
		}
		else if (window.ifcFrame != null)
		{
			new Promise((resolve: (v: number|null) => void): void =>
			{
				window.ifcFrame?.once
				(
					'reply:r-sharp:get-tooltip-timeout',
					(e: IfcFrameEvent, v: number|null): void => resolve(v),
				);
				window.ifcFrame?.send('r-sharp:get-tooltip-timeout');
			})
			.then((v: number|null): void =>
			{
				if (!(v != null)) window.ifcFrame?.send('r-sharp:start-tooltip-timeout');
			});
		}
	}

	private reposition(): void
	{
		const box = this.#content.positioner.box.element!;
		box.style.left = '';
		box.style.right = '';
		box.style.float = '';
		const clientRect: DOMRect = box.getClientRects()[0];
		if (clientRect != null)
		{
			if (clientRect.x + box.offsetWidth >= document.documentElement.clientWidth)
			{
				box.style.right = '0';
				box.style.float = 'right';
			}
			else if (clientRect.x - box.offsetWidth <= 0)
			{
				box.style.left = '0';
				box.style.float = 'left';
			}
			else
			{
				box.style.left = `calc(50% - (${box.offsetWidth}px / 2))`;
				box.style.float = 'left';
			}
		}
		else
		{
			window.setTimeout((): void => this.reposition(), 10);
		}
	}

	constructor(el: Kuudere.HTMLKuudereComponent<Tooltip2>, args: Kuudere.Arguments<string>)
	{
		super(el, args);

		this.#content.element = el;
		
		this.#content.element.classList.add('r-sharp-tooltip');

		const { div } = Kuudere.WebScript.HTML();

		this.#content.element.appendChild(
			div.class`r-sharp-tooltip__positioner`(
				div.class`r-sharp-tooltip__box``${args.constructor}`));

		this.#content.positioner.element = <HTMLDivElement>this.#content.element.querySelector('.r-sharp-tooltip__positioner')!;
		this.#content.positioner.box.element = <HTMLDivElement>this.#content.element.querySelector('.r-sharp-tooltip__box')!;

		this.#content.element.addEventListener('mouseenter', this.#content.onMouseEnter);
		this.#content.element.addEventListener('mouseleave', this.#content.onMouseLeave);
	}

}