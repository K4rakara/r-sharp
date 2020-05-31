interface JsonDomNode
{
	_: string;
	$?: { [key: string]: string };
	''?: (JsonDomNode|string|HTMLElement)[];
}

export class JSONDom
{
	public children: (JsonDomNode|string|HTMLElement)[] = [];

	public toHTML(): string
	{
		let toReturn: string = '';
		this.toDom().forEach((v: HTMLElement|string): void =>
		{
			if (typeof v !== 'string')
				toReturn += v.outerHTML;
			else
				toReturn += v;
		});
		return toReturn;
	}

	public toDom(): (HTMLElement|string)[]
	{
		const processChildren = (children: (JsonDomNode|string|HTMLElement)[]): (HTMLElement|string)[] =>
		{
			const toReturn: (HTMLElement|string)[] = [];
			children.forEach((child: (JsonDomNode|string|HTMLElement)): void =>
			{
				if (typeof child !== 'string')
				{
					if (!(child instanceof HTMLElement))
					{
						const thisElement: HTMLElement = document.createElement(child._);
						Object.keys(child.$ || {}).forEach((key: string): void =>
							thisElement.setAttribute(key, (<any>child).$[key] || ''));
						if (child[''] != null)
						{
							const thisElementChildren: (HTMLElement|string)[] = processChildren(child['']);
							thisElementChildren.forEach((v: HTMLElement|string): void =>
							{
								if (typeof v !== 'string')
									thisElement.appendChild(v);							
								else
									thisElement.innerHTML += v;
							});
						}
						toReturn.push(thisElement);
					}
					else toReturn.push(child);
				}
				else toReturn.push(child);
			});
			return toReturn;
		};
		return processChildren(this.children);
	}

	public appendTo(el: HTMLElement): void
	{
		const asDom: (HTMLElement|string)[] = this.toDom();
		asDom.forEach((v: HTMLElement|string): void =>
		{
			if (typeof v !== 'string') el.appendChild(v);
			else el.innerHTML += v;
		});
	}

	constructor(from: (JsonDomNode|string|HTMLElement)[])
	{
		this.children = from;
	}
}