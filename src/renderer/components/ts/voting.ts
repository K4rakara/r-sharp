import quark from '@quark.js/core';

export class Voting extends quark.Component
{
	constructor(el: HTMLElement, args: any)
	{
		super(el, args);

		const votingContainer: HTMLElement = document.createElement('div');
		votingContainer.classList.add('r-sharp-voting');
		
		quark.append
		(
			votingContainer,
			{
				tag: 'div',
				component: 'upvote-button',
				constructor:
				{

				},
				element: {}
			}
		);

		const votingNumbers: HTMLElement = document.createElement('div');
		votingNumbers.classList.add('r-sharp-voting__text');
		votingNumbers.innerHTML = '420k';
		votingContainer.appendChild(votingNumbers);
		
		quark.append
		(
			votingContainer,
			{
				tag: 'div',
				component: 'downvote-button',
				constructor:
				{

				},
				element: {}
			}
		);

		el.appendChild(votingContainer);
	}
}
