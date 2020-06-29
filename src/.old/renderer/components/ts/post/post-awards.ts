import * as Kuudere from 'kuudere';
import * as utils from '../../../utils';
import { Post } from './post';
import { PostChildConstructor } from './interfaces';
import { RedditLink, RedditAward } from '../../../../main/api/reddit-types';

export class PostAwards extends Kuudere.Component<PostChildConstructor>
{
	#link: RedditLink;

	#content:
	{
		awards: 
		{
			element: HTMLDivElement;
		}[];
		parent?: Kuudere.HTMLKuudereComponent<Post>;
		element?: Kuudere.HTMLKuudereComponent<PostAwards>;
	} =
	{
		awards: [],
	};

	constructor(el: Kuudere.HTMLKuudereComponent<PostAwards>, args: Kuudere.Arguments<PostChildConstructor>)
	{
		super(el, args);

		this.#content.element = el;
		this.#content.parent = args.constructor.parent;
		this.#link = args.constructor.link;

		this.#content.element.classList.add('r-sharp-post__awards');

		this.#link.all_awardings.forEach((award: any) => console.log(award));

		const { div, img } = Kuudere.WebScript.HTML();

		this.#link.all_awardings.forEach((award: RedditAward): void =>
		{
			this.#content.element!.setAttribute('show', '');
			this.#content.awards.push
			({
				element: this.#content.element!.appendChild
				(
					div.class`r-sharp-post__awards__award`(
						img
							.class`r-sharp-post__awards__award-image`
							.src`${award.resized_icons[0].url}`
							[`data-hd-src`]`${award.resized_icons[3].url}```,
						div
							.class`r-sharp-post__awards__award-count`
							`${award.count}`)
				)
			});
		});

		args.constructor.readyForFullLoad.then((): void =>
		{
			this.#content.element!.querySelectorAll('img').forEach((img: HTMLImageElement): void =>
			{
				if (img.hasAttribute('data-hd-src'))
				{
					img.src = img.getAttribute('data-hd-src')!;
					img.removeAttribute('data-hd-src');
				}
			})
		});
	}
}