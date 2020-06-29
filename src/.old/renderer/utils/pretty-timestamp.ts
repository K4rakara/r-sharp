const months: { [key: number]: string; } =
{
	0: 'January',
	1: 'February',
	2: 'March',
	3: 'April',
	4: 'May',
	5: 'June',
	6: 'July',
	7: 'August',
	8: 'September',
	9: 'October',
	10: 'November',
	11: 'December',
};


export function prettyTimestampRoughRelative(v: Date): string
{
	const elapsed: Date = new Date(new Date().getTime() - v.getTime());

	const minutes: number = elapsed.getMinutes();
	const hours: number = elapsed.getHours();
	const day: number = elapsed.getDate();
	const month: number = elapsed.getMonth();
	const year: number = elapsed.getFullYear() - 1970;

	if (year >= 1)
	{
		if (year >= 3)
			return `${year} years ago`;
		else
		{
			if (month >= 1)
				return `${year} year${(year > 1) ? 's' : ''}, ${month} month${(month > 1) ? 's' : ''} ago`;
			else
				return `${year} year${(year > 1) ? 's' : ''} ago`;
		}
	}
	else if (month >= 1)
	{
		if (month >= 6)
			return `${month} months ago`;
		else
		{
			if (day >= 1)
				return `${month} month${(month > 1) ? 's' : ''}, ${day} day${(day > 1) ? 's' : ''} ago`;
			else
				return `${month} month${(month > 1) ? 's' : ''} ago`;
		}
	}
	else if (day >= 1)
	{
		if (day >= 7)
			return `${Math.round(day / 7)} week${(Math.round(day / 7) > 1) ? 's' : ''} ago`;
		else
			return `${day} day${(day > 1) ? 's' : ''} ago`;
	}
	else if (hours >= 1)
		return `${hours} hour${(hours > 1) ? 's' : ''} ago`;
	else if (minutes >= 1)
		return `${minutes} minute${(minutes > 1) ? 's' : ''} ago`;
	else
		return 'Just now';
}

export function prettyTimestampRoughStatic(v: Date): string
{
	const minutes: number = v.getMinutes();
	const hours: number = v.getHours();
	const day: number = v.getDate();
	const month: number = v.getMonth();
	const year: number = v.getFullYear() - 1970;

	if (year >= 1)
	{
		if (year >= 3)
			return `${year} years ago`;
		else
		{
			if (month >= 1)
				return `${year} year${(year > 1) ? 's' : ''}, ${month} month${(month > 1) ? 's' : ''} ago`;
			else
				return `${year} year${(year > 1) ? 's' : ''} ago`;
		}
	}
	else if (month >= 1)
	{
		if (month >= 6)
			return `${month} months ago`;
		else
		{
			if (day >= 1)
				return `${month} month${(month > 1) ? 's' : ''}, ${day} day${(day > 1) ? 's' : ''} ago`;
			else
				return `${month} month${(month > 1) ? 's' : ''} ago`;
		}
	}
	else if (day >= 1)
	{
		if (day >= 7)
			return `${Math.round(day / 7)} week${(Math.round(day / 7) > 1) ? 's' : ''} ago`;
		else
			return `${day} day${(day > 1) ? 's' : ''} ago`;
	}
	else if (hours >= 1)
		return `${hours} hour${(hours > 1) ? 's' : ''} ago`;
	else if (minutes >= 1)
		return `${minutes} minute${(minutes > 1) ? 's' : ''} ago`;
	else
		return 'Just now';
}

export function prettyTimestampExactStatic(v: Date): string
{
	const month: string = months[v.getMonth()];
	const year: number = v.getFullYear();
	if (year - new Date().getFullYear() >= 10)
		return `${month} ${year}`; // => "January 2020", for example.
	else
	{
		const day: number = v.getDate();
		const daySuffix: string =
			((): string =>
			{
				if (day.toString().endsWith('1'))
					return 'st';
				else if (day.toString().endsWith('2'))
					return 'nd';
				else if (day.toString().endsWith('3'))
					return 'rd';
				else
					return 'st';
			})();
		return `${month} ${day}${daySuffix}, ${year}`; // => "December 31st, 2019", for example.
	}
}

export function prettyTimestampDynamic(v: Date): string
{
	const elapsed: Date = new Date(new Date().getTime() - v.getTime());

	if (elapsed.getFullYear() - 1970 >= 5)
		return prettyTimestampExactStatic(v);
	else
		return prettyTimestampRoughRelative(v);
}

export function prettyTimestampRoughRelativeShort(v: Date): string
{
	const elapsed: Date = new Date(new Date().getTime() - v.getTime());

	const minutes: number = elapsed.getMinutes();
	const hours: number = elapsed.getHours();
	const day: number = elapsed.getDate();
	const month: number = elapsed.getMonth();
	const year: number = elapsed.getFullYear() - 1970;

	if (year >= 1)
		return `${year}Y`;
	else if (month >= 1)
		return `${month}M`;
	else if (day >= 7)
		return `${Math.round(day / 7)}W`;
	else if (day >= 1)
		return `${day}D`;
	else if (hours >= 1)
		return `${hours}H`;
	else if (minutes >= 1)
		return `${minutes}m`;
	else
		return 'Now';
}

