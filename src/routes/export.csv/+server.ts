import { env } from 'cloudflare:workers';
import { desc } from 'drizzle-orm';
import { MINOR_UNIT } from '../../lib/project';
import { getDb } from '../../lib/server/db';
import { project } from '../../lib/server/db/schema';
import { parseFilter } from '../../lib/server/project-query';
import { STATUS_LABELS } from '../../lib/status';
import type { RequestHandler } from './$types';

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

// Spreadsheets run a cell that starts with one of these as a formula. Prefixing a quote
// keeps typed text from being executed when the file is opened.
const FORMULA = /^[=+\-@\t\r]/;

const text = (value: string) => {
	const safe = FORMULA.test(value) ? `'${value}` : value;
	return /[",\r\n]/.test(safe) ? `"${safe.replaceAll('"', '""')}"` : safe;
};

// Downloads the projects the list is showing, so `?q=` and `?status=` apply here too.
export const GET: RequestHandler = async ({ url }) => {
	const { where } = parseFilter(url);

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
		.orderBy(desc(project.createdAt));

	const lines = rows.map((p) =>
		[
			text(p.name),
			text(p.customer),
			STATUS_LABELS[p.status],
			// The amount is only set once a project is won.
			p.status === 'won' ? (p.amount / MINOR_UNIT).toFixed(Math.log10(MINOR_UNIT)) : '',
			p.closedOn ?? '',
			text(p.note),
			text(p.projectDetail),
			text(p.customerDetail),
			text(p.closeNote),
			p.createdAt.toISOString(),
			p.updatedAt.toISOString()
		].join(',')
	);

	// The BOM makes Excel read the file as UTF-8.
	const body = '﻿' + [HEADER.join(','), ...lines].join('\r\n') + '\r\n';

	return new Response(body, {
		headers: {
			'content-type': 'text/csv; charset=utf-8',
			'content-disposition': `attachment; filename="jameson-projects-${new Date().toISOString().slice(0, 10)}.csv"`,
			'cache-control': 'no-store'
		}
	});
};
