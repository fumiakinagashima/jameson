import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { PROJECT_STATUSES } from '../../status';

const id = () =>
	text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID());

const createdAt = () =>
	integer('created_at', { mode: 'timestamp_ms' })
		.notNull()
		.$defaultFn(() => new Date());

export const project = sqliteTable('project', {
	id: id(),
	// Optional. When empty, the UI shows "Not set".
	name: text('name').notNull().default(''),
	projectDetail: text('project_detail').notNull().default(''),
	customer: text('customer').notNull(),
	customerDetail: text('customer_detail').notNull().default(''),
	status: text('status', { enum: PROJECT_STATUSES }).notNull().default('lead'),
	// Final amount in minor currency units (e.g. cents), set only when the project is won.
	// Stays 0 while open or lost; any expected amount is written as text in projectDetail.
	// The currency is an instance-wide setting.
	amount: integer('amount').notNull().default(0),
	// Contact person on the customer side.
	contact: text('contact').notNull().default(''),
	note: text('note').notNull().default(''),
	// 'YYYY-MM-DD', the date the project was marked won or lost. Null while open.
	// A calendar date picked by the user, so it carries no time zone (unlike the *_at instants).
	closedOn: text('closed_on'),
	// Note on the win, or the reason for the loss.
	closeNote: text('close_note').notNull().default(''),
	createdAt: createdAt(),
	// `sub` claim of the Cloudflare Access JWT. Null when unauthenticated (e.g. local dev).
	createdBy: text('created_by'),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
		.notNull()
		.$defaultFn(() => new Date())
		.$onUpdateFn(() => new Date()),
	updatedBy: text('updated_by')
});

export const task = sqliteTable(
	'task',
	{
		id: id(),
		projectId: text('project_id')
			.notNull()
			.references(() => project.id, { onDelete: 'cascade' }),
		title: text('title').notNull(),
		// 'YYYY-MM-DD'. Null means no due date.
		dueDate: text('due_date'),
		// Null means still open. Completed tasks double as the activity history.
		doneAt: integer('done_at', { mode: 'timestamp_ms' }),
		createdAt: createdAt(),
		createdBy: text('created_by'),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.notNull()
			.$defaultFn(() => new Date())
			.$onUpdateFn(() => new Date()),
		updatedBy: text('updated_by')
	},
	(t) => [index('task_project_id_idx').on(t.projectId)]
);
