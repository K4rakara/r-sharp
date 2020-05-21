
//@ts-ignore
Date.prototype.addSeconds = function(s: number)
{
	this.setSeconds(this.getSeconds() + s);
	return this;
}

export const _ = null;