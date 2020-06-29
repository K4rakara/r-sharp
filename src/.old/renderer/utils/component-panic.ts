export const componentPanicMessage = (componentName: string): string =>
{
	return `A(n) ${componentName} entered a state in which it can no longer function. It will be removed from the DOM.`;
}