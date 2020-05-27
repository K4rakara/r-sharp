import { IfcRoot, IfcRootEvent } from "./ifc-root";


export class IfcFrame
{
	public listeners: { [key: string]: (e: IfcFrameEvent, ...args: any[]) => void };
	public parent?: IfcRoot;

	public on(channel: string, cb: (e: IfcFrameEvent, ...args: any[]) => void): void
	{
		this.listeners[channel] = cb;
	}

	public once(channel: string, cb: (e: IfcFrameEvent, ...args: any[]) => void): void
	{
		this.listeners[channel] = (e: IfcFrameEvent, ...args: any[]): void =>
		{
			cb(e, ...args);
			delete this.listeners[channel];
		};
	}

	public send(channel: string, ...args: any[]): void
	{
		if (this.parent?.listeners[channel] != null)
		{
			this.parent?.listeners[channel](new IfcRootEvent(this.parent, this), ...args);
		}
	}

	constructor(parent?: IfcRoot)
	{
		this.listeners = {};
		this.parent = parent;
	}
}

export class IfcFrameEvent
{
	private replyTo: IfcRoot;
	private parent: IfcFrame;

	public reply(channel: string, ...args: any[]): void
	{
		if (this.replyTo.listeners[channel] != null)
		{
			this.replyTo.listeners[channel](new IfcRootEvent(this.replyTo, this.parent), ...args);
		}
	}

	constructor(parent: IfcFrame, replyTo: IfcRoot)
	{
		this.replyTo = replyTo;
		this.parent = parent;
	}
}