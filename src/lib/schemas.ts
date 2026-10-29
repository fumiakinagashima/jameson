import { z } from 'zod';
import { m } from './paraglide/messages.js';
import { OPEN_STATUSES } from './status';

// The input of each form action in `src/routes/+page.server.ts`. The message of the first
// problem is what the page shows. Messages are functions so each one is read in the language
// of the request being validated, not the language at the time this module loaded.

const SHORT = 200;
const LONG = 10_000;
const MAX_AMOUNT = 1e12;

const id = z.string({ error: () => m.invalid_request() }).min(1, { error: () => m.invalid_request() });

// A single line such as a name or a title, and a free-text block such as a note or a detail.
const line = (tooLong: () => string) => z.string().trim().max(SHORT, { error: () => tooLong() });
const text = (tooLong: () => string) => z.string().max(LONG, { error: () => tooLong() }).default('');

// 'YYYY-MM-DD', and a day that exists on the calendar.
const date = (message: () => string) => z.iso.date({ error: () => message() });

const amount = z.coerce
	.number({ error: () => m.invalid_amount() })
	.min(0, { error: () => m.invalid_amount() })
	.max(MAX_AMOUNT, { error: () => m.invalid_amount() });

export const forms = {
	byId: z.object({ id }),
	updateProject: z.object({
		id,
		name: line(m.project_name_too_long).default(''),
		detail: text(m.detail_too_long)
	}),
	updateCustomer: z.object({
		id,
		customer: line(m.customer_name_too_long).min(1, { error: () => m.customer_required() }),
		detail: text(m.detail_too_long)
	}),
	// Won and Lost are set through their own actions.
	updateStatus: z.object({ id, status: z.enum(OPEN_STATUSES, { error: () => m.invalid_status() }) }),
	updateNote: z.object({ id, note: text(m.note_too_long) }),
	winProject: z.object({
		id,
		closedOn: date(m.invalid_date),
		amount,
		note: text(m.note_too_long)
	}),
	loseProject: z.object({ id, closedOn: date(m.invalid_date), reason: text(m.reason_too_long) }),
	addTask: z.object({
		projectId: id,
		title: line(m.task_title_too_long).min(1, { error: () => m.task_title_required() }),
		dueDate: date(m.invalid_due_date)
	})
};
