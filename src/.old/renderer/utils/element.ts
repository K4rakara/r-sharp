declare global
{
	interface Element
	{
		appendChildren(...newChildren: Element[]): Element[];
	}
}

Element.prototype.appendChildren = function(...newChildren: Element[]): Element[]
{
	const toReturn: Element[] = [];
	newChildren.forEach((newChild: Element): void =>
	{
		toReturn.push(this.appendChild(newChild));
	})
	return toReturn;
}

export const _ = '';