// Tasks due within this many days after today raise the warning icon next to a project's open
// task count, as do tasks due today and late ones. Only today and late tasks also tint the row.
export const DUE_SOON_DAYS = 1;

export type DueLevel = 'overdue' | 'today' | 'soon' | null;

// 'YYYY-MM-DD' plus a number of days. Dates carry no time zone, so the arithmetic is done in UTC.
const addDays = (date: string, days: number) => {
	const d = new Date(`${date}T00:00:00Z`);
	d.setUTCDate(d.getUTCDate() + days);
	return d.toISOString().slice(0, 10);
};

// How urgent a project's open tasks are, from their due dates and today's date (the viewer's
// local one, 'YYYY-MM-DD'). The most urgent wins: overdue, then today, then soon (the days after
// today). A task without a due date never counts.
export const dueLevel = (dueDates: (string | null)[], today: string): DueLevel => {
	const dates = dueDates.filter((d): d is string => !!d);
	if (dates.some((d) => d < today)) return 'overdue';
	if (dates.includes(today)) return 'today';
	const limit = addDays(today, DUE_SOON_DAYS);
	return dates.some((d) => d <= limit) ? 'soon' : null;
};
