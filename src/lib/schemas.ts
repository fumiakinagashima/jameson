import { z } from 'zod';
import { OPEN_STATUSES } from './status';

// The input of each form action in `src/routes/+page.server.ts`. The message of the first
// problem is what the page shows.

const SHORT = 200;
const LONG = 10_000;
const MAX_AMOUNT = 1e12;

const id = z.string({ error: 'Invalid request.' }).min(1, { error: 'Invalid request.' });

// A single line such as a name or a title, and a free-text block such as a note or a detail.
const line = (what: string) => z.string().trim().max(SHORT, { error: `${what} is too long.` });
const text = (what: string) => z.string().max(LONG, { error: `${what} is too long.` }).default('');

// 'YYYY-MM-DD', and a day that exists on the calendar.
const date = (message: string) => z.iso.date({ error: message });

const amount = z.coerce
	.number({ error: 'Invalid amount.' })
	.min(0, { error: 'Invalid amount.' })
	.max(MAX_AMOUNT, { error: 'Invalid amount.' });

export const forms = {
	byId: z.object({ id }),
	updateProject: z.object({ id, name: line('Project name').default(''), detail: text('Detail') }),
	updateCustomer: z.object({
		id,
		customer: line('Customer name').min(1, { error: 'Customer name is required.' }),
		detail: text('Detail')
	}),
	// Won and Lost are set through their own actions.
	updateStatus: z.object({ id, status: z.enum(OPEN_STATUSES, { error: 'Invalid status.' }) }),
	updateNote: z.object({ id, note: text('Note') }),
	winProject: z.object({ id, closedOn: date('Invalid date.'), amount, note: text('Note') }),
	loseProject: z.object({ id, closedOn: date('Invalid date.'), reason: text('Reason') }),
	addTask: z.object({
		projectId: id,
		title: line('Task title').min(1, { error: 'Task title is required.' }),
		dueDate: date('Invalid due date.')
	})
};
