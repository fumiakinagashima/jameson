import { env } from 'cloudflare:workers';
import { MINOR_UNIT } from '../../lib/project';
import { cell, toCsv } from '../../lib/server/csv';
import { getDb } from '../../lib/server/db';
import { project } from '../../lib/server/db/schema';
import { parseListQuery } from '../../lib/server/project-query';
import { statusLabel } from '../../lib/status';
import type { RequestHandler } from './$types';

// The CSV is data, not screen text: the header and the status names stay in English
// whatever language the browser uses.
const HEADER = [
	'Project',
	'Customer',
	'Status',
	'Amount',
	'Closed on',
	'Note',
	'Project detail',
	'Customer detail',
	'Close note',
	'Created at (UTC)',
	'Updated at (UTC)'
];

// Downloads the projects the list is showing, so `?q=`, `?status=` and `?sort=` apply here too.
export const GET: RequestHandler = async ({ url }) => {
	const { where, orderBy } = parseListQuery(url);

	const rows = await getDb(env.DB)
		.select({
			name: project.name,
			customer: project.customer,
			status: project.status,
			amount: project.amount,
			closedOn: project.closedOn,
			note: project.note,
			projectDetail: project.projectDetail,
			customerDetail: project.customerDetail,
			closeNote: project.closeNote,
			createdAt: project.createdAt,
			updatedAt: project.updatedAt
		})
		.from(project)
		.where(where)
		.orderBy(...orderBy);

	const lines = rows.map((p) => [
		cell(p.name),
		cell(p.customer),
		statusLabel(p.status, 'en'),
		// The amount is only set once a project is won.
		p.status === 'won' ? (p.amount / MINOR_UNIT).toFixed(Math.log10(MINOR_UNIT)) : '',
		p.closedOn ?? '',
		cell(p.note),
		cell(p.projectDetail),
		cell(p.customerDetail),
		cell(p.closeNote),
		p.createdAt.toISOString(),
		p.updatedAt.toISOString()
	]);

	return new Response(toCsv(HEADER, lines), {
		headers: {
			'content-type': 'text/csv; charset=utf-8',
			'content-disposition': `attachment; filename="jameson-projects-${new Date().toISOString().slice(0, 10)}.csv"`,
			'cache-control': 'no-store'
		}
	});
};
