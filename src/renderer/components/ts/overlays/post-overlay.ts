import * as Kuudere from 'kuudere';
import { PostChildConstructor } from '../post';

export class PostOverlay extends Kuudere.Component<PostChildConstructor>
{
	constructor(el: Kuudere.HTMLKuudereComponent<PostOverlay>, args: Kuudere.Arguments<PostChildConstructor>)
	{
		super(el, args);

		const { div } = Kuudere.WebScript.HTML();

		el.appendChildren
		(
			div.class`r-sharp-post-overlay__scrim r-sharp-scrim`(),
			div.class`r-sharp-post-overlay__main`(
				div.class`r-sharp-post-overlay__post-container`(
					// Add Kuudere version of post component here.
				),
				div.class`r-sharp-post-overlay__community-container`(
					// Add Kuudere community component here.
				))
		);
	}
}