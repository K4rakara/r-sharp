import { IfcFrame, IfcFrameEvent } from "./ifc-frame";

export class IfcRoot
{
	public listeners: { [key: string]: (e: IfcRootEvent, ...args: any[]) => void };

	public on(channel: string, cb: (e: IfcRootEvent, ...args: any[]) => void): void
	{
		this.listeners[channel] = cb;
	}

	public once(channel: string, cb: (e: IfcRootEvent, ...args: any[]) => void): void
	{
		this.listeners[channel] = (e: IfcRootEvent, ...args: any[]): void =>
		{
			cb(e, ...args);
			delete this.listeners[channel];
		};
	}

	public send(to: IfcFrame, channel: string, ...args: any[]): void
	{
		to.parent = this;
		if (to.listeners[channel] != null)
		{
			to.listeners[channel](new IfcFrameEvent(to, this), ...args);
		}
	}

	constructor()
	{
		this.listeners = {};
	}
}

export class IfcRootEvent
{
	private replyTo: IfcFrame;
	private parent: IfcRoot;

	public reply(channel: string, ...args: any[]): void
	{
		if (this.replyTo.listeners[channel] != null)
		{
			this.replyTo.listeners[channel](new IfcFrameEvent(this.replyTo, this.parent), ...args);
		}
	}

	constructor(parent: IfcRoot, replyTo: IfcFrame)
	{
		this.replyTo = replyTo;
		this.parent = parent;
	}
}

export const ifcRoot = new IfcRoot();

export default ifcRoot;