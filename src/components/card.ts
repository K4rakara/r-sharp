import quark from '@quark.js/core';

interface CardField
{
	type: 'field'|'component';
	display: 'inline'|'block';
	direction: 'row'|'row-reverse'|'column'|'column-reverse';
	fields?: CardField[];
	constructor: any;
	element: { [key: string]: any };
	component: string;
}

interface CardConstructor
{
	direction: 'row'|'row-reverse'|'column'|'column-reverse';
	fields: CardField[];
}

interface CardArguments
{
	constructor: CardConstructor;
	tag?: string;
	element: { [key: string]: any };
	component: string;
}

export class Card extends quark.Component
{
	
	#QuarkData = class
	{
		
		#element: HTMLElement;

		constructor(el: HTMLElement)
		{
			this.#element = el;
		}

	}

	constructor(el: HTMLElement, args: CardArguments)
	{
		super(el, args);

		const card: HTMLDivElement = document.createElement('div');
		card.classList.add('r-sharp-card__surface');
		card.style.cssText += `flex-direction: ${args.constructor.direction};`;
		
		const processFields = (targetFields: CardField[], targetElement: HTMLDivElement): void =>
		{
			targetFields.forEach((field: CardField): void =>
			{
				const thisElement: HTMLDivElement = document.createElement('div');

				thisElement.style.cssText +=
					`display: ${
						(field.display === 'inline')
							? 'inline-flex'
							: 'flex'
					};${'\n'
					}flex-direction: ${field.direction};`;

				if (field.type === 'field')
				{
					if (field.fields != null)
					{
						processFields(field.fields, thisElement);
						targetElement.appendChild(thisElement);
					}
				}
				else if (field.type === 'component')
				{
					quark.replace(thisElement, { ...field });
					targetElement.appendChild(thisElement);
				}
			});
		};

		processFields(args.constructor.fields, card);

		el.appendChild(card);

		//@ts-ignore
		el.quark = new this.#QuarkData(el);
	}

}