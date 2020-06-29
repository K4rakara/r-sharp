declare global
{
	interface Array<T>
	{
		join(): string;
		join(separator?: string): string;
		join(separator?: string, finalSeparator?: string): string;
	}
	interface Number
	{
		/**
		 * Returns the number with the appropriate suffix.
		 * 
		 * Example:
		 * ```
		 * console.log((1).toStringWithSuffix()); // Logs "1st"
		 * console.log((2).toStringWithSuffix()); // Logs "2nd"
		 * console.log((3).toStringWithSuffix()); // Logs "3rd"
		 * console.log((4).toStringWithSuffix()); // Logs "4th"
		 * console.log((11).toStringWithSuffix()); // Logs "11th"
		 * console.log((21).toStringWithSuffix()); // Logs "21st"
		 * ```
		 */
		toStringWithSuffix(): string;
		/**
		 * Returns the number with the appropriate amount of padding.
		 * 
		 * Example:
		 * ```
		 * console.log((1).toStringWithPadding(3)); // Logs "003"
		 * ```
		 */
		toStringWithPadding(amt: number): string;
	}
	interface Element
	{
		appendChildren(...newChildren: Element[]): Element[];	
	}
	interface Date
	{
		/**
		 * Converts a `Date` into `DD/MM/YYYY` format.
		 * 
		 * Example:
		 * ```plain
		 * 06/24/2020
		 * ```
		 */
		toDateLike(): string;
		/**
		 * Converts a `Date` into `DD/MM/YY` format.
		 * 
		 * Example:
		 * ```plain
		 * 06/24/20
		 * ```
		 */
		toDateLikeShort(): string;
		/**
		 * Converts a `Date` into `DAY-NAME, DD/MM/YYYY` format.
		 * 
		 * Example:
		 * ```plain
		 * Wednesday, 06/24/2020
		 * ```
		 */
		toDateLikeExtended(): string;
		/**
		 * Converts a `Date` into `DAY-NAME, DD/MM/YY` format.
		 * 
		 * Example:
		 * ```plain
		 * Wednesday, 06/24/20
		 * ```
		 */
		toDateLikeShortExtended(): string;
		/**
		 * Converts a `Date` into 
		 */
		/**
		 * Converts a `Date` into `MONTH-NAME DAY, YEAR` format.
		 * 
		 * Example:
		 * ```plain
		 * June 24th, 2020
		 * ```
		 */
		toPrettyDateLike(): string;
		/**
		 * Converts a `Date` into `DAY-NAME, MONTH-NAME DAY, YEAR` format.
		 * 
		 * Example:
		 * ```plain
		 * Wednesday, June 24th, 2020
		 * ```
		 */
		toPrettyDateLikeExtended(): string;
		/**
		 * Converts a `Date` into `HH:MM:SS` format.
		 * 
		 * Example:
		 * ```plain
		 * 13:13:05
		 * ```
		 */
		toTimeLike(): string;
		/**
		 * Converts a `Date` into 12-hour `HH:MM:SS AM|PM` format.
		 * 
		 * Example:
		 * ```plain
		 * 01:13:05 PM
		 * ```
		 */
		toTimeLike12(): string;
	}
}

if (typeof self !== 'undefined')
{
	if (window.Element != null)
	{
		Element.prototype.appendChildren = function(...newChildren: Element[]): Element[]
		{
			const toReturn: Element[] = [];
			newChildren.forEach((newChild: Element): void =>
			{
				toReturn.push(this.appendChild(newChild));
			})
			return toReturn;
		}
	}
}

if (Array != null)
{
	const oldJoin = Array.prototype.join;
	Array.prototype.join = function(separator?: string, finalSeparator?: string): string
	{
		if (finalSeparator != null)
		{
			let toReturn: string = '';
			this.forEach((v: any, i: number): void =>
			{
				if (i !== this.length - 1)
					toReturn += v + separator;
				else
					toReturn += v + finalSeparator;
			});
			return toReturn;
		}
		else
			return oldJoin.call(this, separator);
	}
}

if (Number != null)
{
	Number.prototype.toStringWithSuffix = function(): string
	{
		const suffix: string = ((): string =>
		{
			const asString: string = this.toString();
			if (this > 20)
				if (asString.endsWith('1'))
					return 'st';
				else if (asString.endsWith('2'))
					return 'nd';
				else if (asString.endsWith('3'))
					return 'rd';
				else
					return 'th';
			else
				if (this > 10)
					return 'th';
				else
					if (asString.endsWith('1'))
						return 'st';
					else if (asString.endsWith('2'))
						return 'nd';
					else if (asString.endsWith('3'))
						return 'rd';
					else
						return 'th';
		})();
		return `${this.toString()}${suffix}`;
	}
	Number.prototype.toStringWithPadding = function(amt: number): string
	{
		let toReturn: string = this.toString();
		while (toReturn.length > amt) toReturn = '0' + toReturn;
		return toReturn;
	}
}

if (Date != null)
{
	const days: string[] =
	[
		'Sunday',
		'Monday',
		'Tuesday',
		'Wednesday',
		'Thursday',
		'Friday',
		'Saturday',
	];

	const months: string[] =
	[
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December',
	];
	
	Date.prototype.toDateLike = function(): string
	{
		return `${
			this.getDate().toStringWithPadding(2)
		}/${
			this.getMonth().toStringWithPadding(2)
		}/${
			this.getFullYear().toStringWithPadding(4)
		}`;
	}

	Date.prototype.toDateLikeShort = function(): string
	{
		return `${
			this.getDate().toStringWithPadding(2)
		}/${
			this.getMonth().toStringWithPadding(2)
		}/${
			this.getFullYear().toStringWithPadding(2).substring(2)
		}`;
	}

	Date.prototype.toDateLikeExtended = function(): string
	{
		return `${
			days[this.getDay()]
		}, ${
			this.getDate().toStringWithPadding(2)
		}/${
			this.getMonth().toStringWithPadding(2)
		}/${
			this.getFullYear().toStringWithPadding(4)
		}`;
	}

	Date.prototype.toDateLikeShortExtended = function(): string
	{
		return `${
			days[this.getDay()]
		}, ${
			this.getDate().toStringWithPadding(2)
		}/${
			this.getMonth().toStringWithPadding(2)
		}/${
			this.getFullYear().toStringWithPadding(2).substring(2)
		}`;
	}

	Date.prototype.toPrettyDateLike = function(): string
	{
		return `${
			months[this.getMonth()]
		} ${
			this.getDate().toStringWithSuffix()
		}, ${
			this.getFullYear()
		}`;
	}

	Date.prototype.toPrettyDateLikeExtended = function(): string
	{
		return `${
			days[this.getDay()]
		}, ${
			months[this.getMonth()]
		} ${
			this.getDate().toStringWithSuffix()
		}, ${
			this.getFullYear()
		}`;
	}

	Date.prototype.toTimeLike = function(): string
	{
		return `${
			this.getHours().toStringWithPadding(2)
		}:${
			this.getMinutes().toStringWithPadding(2)
		}:${
			this.getSeconds().toStringWithPadding(2)
		}`;
	}

	Date.prototype.toTimeLike12 = function(): string
	{
		return `${
			(this.getHours() > 12)
				? (this.getHours() - 12).toStringWithPadding(2)
				: this.getHours().toStringWithPadding(2)
		}:${
			this.getMinutes().toStringWithPadding(2)
		}:${
			this.getSeconds().toStringWithPadding(2)
		} ${
			(this.getHours() > 12)
				? 'PM'
				: 'AM'
		}`;
	}
}

export const _ = null;
