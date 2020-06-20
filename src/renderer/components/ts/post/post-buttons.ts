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
					`${utils.prettyNumber(this.#link.num_comments)}`),
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