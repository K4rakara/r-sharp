declare global
{
	interface Date
	{
		addSeconds(s: number): Date;
		inSeconds(): number;
		isPast(d: Date): boolean;
	}
}

Date.prototype.addSeconds = function(s: number): Date
{
	this.setSeconds(this.getSeconds() + s);
	return this;
}

Date.prototype.inSeconds = function(): number
{
	return Math.round(this.getTime() / 1000);
}

Date.prototype.isPast = function(d: Date): boolean
{
	return (this.inSeconds() > d.inSeconds());
}

export const _ = null;