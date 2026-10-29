import { and, asc, desc, eq, inArray, or, sql } from 'drizzle-orm';
import { SORT_KEYS, type Sort } from '../project';
import { OPEN_STATUSES, PROJECT_STATUSES } from '../status';
import { project } from './db/schema';

// What each sort key orders by. The project column sorts by what the list shows (the name,
// or the customer when there is no name). Status sorts in pipeline order, not alphabetically.
const sortColumns = {
	project: sql`lower(coalesce(nullif(${project.name}, ''), ${project.customer}))`,
	customer: sql`lower(${project.customer})`,
	status: sql`case ${project.status} ${sql.join(
		PROJECT_STATUSES.map((s, i) => sql`when ${s} then ${i}`),
		sql` `
	)} end`
};

// What the list shows, read from `?status=`, `?q=`, `?sort=` and `?dir=`. Shared by the list
// and the CSV export, so a download matches what is on screen.
export const parseListQuery = (url: URL) => {
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

	// Rows that tie on the sort key (and the default order) stay newest first.
	const key = SORT_KEYS.find((k) => k === url.searchParams.get('sort'));
	const sort: Sort = key ? { key, dir: url.searchParams.get('dir') === 'desc' ? 'desc' : 'asc' } : null;
	const direction = sort?.dir === 'desc' ? desc : asc;

	return {
		filter: { text, status: all ? 'all' : (status ?? '') },
		sort,
		where: and(
			all ? undefined : status ? eq(project.status, status) : inArray(project.status, OPEN_STATUSES),
			...terms.map((term) =>
				or(...searchable.map((column) => sql`instr(lower(${column}), ${term.toLowerCase()}) > 0`))
			)
		),
		orderBy: [...(sort ? [direction(sortColumns[sort.key])] : []), desc(project.createdAt)]
	};
};
