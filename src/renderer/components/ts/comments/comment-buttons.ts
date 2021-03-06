import * as Kuudere from 'kuudere';
import
{
	CommentButtonsConstructor,
	Comment,
}
from '.';
import { MDCRipple } from '@material/ripple';

export class CommentButtons extends Kuudere.Component<CommentButtonsConstructor>
{
	private content:
	{
		reply:
		{
			onMouseUp: (el: HTMLSpanElement, e: MouseEvent) => void;
			element?: HTMLSpanElement;
		};
		award:
		{
			element?: HTMLSpanElement;
		};
		share:
		{
			element?: HTMLSpanElement;
		};
		save:
		{
			element?: HTMLSpanElement;
		};
		report:
		{
			element?: HTMLSpanElement;
		};
		parent?: Kuudere.HTMLKuudereComponent<Comment>;
		element?: Kuudere.HTMLKuudereComponent<CommentButtons>;
	} =
	{
		reply:
		{
			onMouseUp: (el: HTMLSpanElement, e: MouseEvent): void =>
			{
				if (e.button === 0)
				{
					// TODO: Call a function on this.content.parent.__props to open a reply composer.
				}
			},
		},
		award:
		{

		},
		share:
		{

		},
		save:
		{

		},
		report:
		{

		},
	};

	constructor(el: Kuudere.HTMLKuudereComponent<CommentButtons>, args: Kuudere.Arguments<CommentButtonsConstructor>)
	{
		super(el, args);

		this.content.element = el;
		this.content.parent = args.constructor.parent;

		el.classList.add('_buttons');

		const { div, i } = Kuudere.WebScript.HTML();

		el.appendChildren
		(
			div
				.class`_button mdc-ripple-surface`
				.$listeners({})(
					i.class`r-sharp-icons__comment```,
					`Reply`),
			div
				.class`_button mdc-ripple-surface`
				.$listeners({})(
					i.class`r-sharp-icons__give-award```,
					`Award`),
			div
				.class`_button mdc-ripple-surface`
				.$listeners({})(
					i.class`r-sharp-icons__share```,
					`Share`),
			div
				.class`_button mdc-ripple-surface`
				.$listeners({})(
					i.class`r-sharp-icons__save```,
					`Save`),
			div
				.class`_button mdc-ripple-surface`
				.$listeners({})(
					i.class`r-sharp-icons__report```,
					`Report`),
		);

		this.content.reply.element = <HTMLSpanElement>el.querySelector('._button:nth-child(1)')!;
		this.content.award.element = <HTMLSpanElement>el.querySelector('._button:nth-child(2)')!;
		this.content.share.element = <HTMLSpanElement>el.querySelector('._button:nth-child(3)')!;
		this.content.save.element = <HTMLSpanElement>el.querySelector('._button:nth-child(4)')!;
		this.content.report.element = <HTMLSpanElement>el.querySelector('._button:nth-child(5)')!;

		MDCRipple.attachTo(this.content.reply.element!);
		MDCRipple.attachTo(this.content.award.element!);
		MDCRipple.attachTo(this.content.share.element!);
		MDCRipple.attachTo(this.content.save.element!);
		MDCRipple.attachTo(this.content.report.element!);
	}
}