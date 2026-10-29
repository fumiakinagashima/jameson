import { and, eq, inArray, or, sql } from 'drizzle-orm';
import { OPEN_STATUSES, PROJECT_STATUSES } from '../status';
import { project } from './db/schema';

// The list filter, read from `?status=` and `?q=`. Shared by the list and the CSV export,
// so a download matches what is on screen.
export const parseFilter = (url: URL) => {
	// Open projects by default. `?status=` shows one status, including won and lost,
	// and `?status=all` shows every project.
	const requested = url.searchParams.get('status');
	const all = requested === 'all';
	const status = PROJECT_STATUSES.find((s) => s === requested);

	// `?q=` keeps the projects that contain every whitespace-separated term, ignoring case,
	// in any of the text columns. instr() avoids LIKE escaping and D1's LIKE pattern length limit.
	const text = (url.searchParams.get('q') ?? '').trim().slice(0, 100);
	const terms = text.split(/\s+/).filter(Boolean);
	const searchable = [project.name, project.customer, project.note, project.projectDetail, project.customerDetail];

	return {
		filter: { text, status: all ? 'all' : (status ?? '') },
		where: and(
			all ? undefined : status ? eq(project.status, status) : inArray(project.status, OPEN_STATUSES),
			...terms.map((term) =>
				or(...searchable.map((column) => sql`instr(lower(${column}), ${term.toLowerCase()}) > 0`))
			)
		)
	};
};
