import { fail } from '@sveltejs/kit';
import { env } from 'cloudflare:workers';
import { eq } from 'drizzle-orm';
import { getDb } from '../lib/server/db';
import { project, task } from '../lib/server/db/schema';
import { parseListQuery } from '../lib/server/project-query';
import { MINOR_UNIT, projectLabel } from '../lib/project';
import { OPEN_STATUSES } from '../lib/status';
import type { Actions, PageServerLoad } from './$types';

const DATE = /^\d{4}-\d{2}-\d{2}$/;

const database = () => getDb(env.DB);

const actor = (locals: App.Locals) => locals.user?.sub ?? null;

const str = (form: FormData, key: string) => {
	const value = form.get(key);
	return typeof value === 'string' ? value : '';
};

export const load: PageServerLoad = async ({ url }) => {
	const db = database();
	const { filter, sort, where, orderBy } = parseListQuery(url);

	const projects = await db
		.select({
			id: project.id,
			name: project.name,
			customer: project.customer,
			status: project.status,
			note: project.note,
			projectDetail: project.projectDetail,
			customerDetail: project.customerDetail
		})
		.from(project)
		.where(where)
		.orderBy(...orderBy);

	const tasks = await db
		.select({
			id: task.id,
			projectId: task.projectId,
			projectName: project.name,
			customer: project.customer,
			title: task.title,
			dueDate: task.dueDate,
			doneAt: task.doneAt
		})
		.from(task)
		.innerJoin(project, eq(task.projectId, project.id));

	return {
		filter,
		sort,
		projects,
		tasks: tasks.map(({ customer, projectName, doneAt, ...t }) => ({
			...t,
			projectName: projectLabel({ name: projectName, customer }),
			doneAt: doneAt ? doneAt.toISOString() : null
		}))
	};
};

export const actions: Actions = {
	createProject: async ({ locals }) => {
		const by = actor(locals);
		await database()
			.insert(project)
			.values({
				name: 'New Project',
				customer: 'Cutomer',
				createdBy: by,
				updatedBy: by
			});
	},

	updateProject: async ({ request, locals }) => {
		const form = await request.formData();
		await database()
			.update(project)
			.set({
				name: str(form, 'name').trim(),
				projectDetail: str(form, 'detail'),
				updatedBy: actor(locals)
			})
			.where(eq(project.id, str(form, 'id')));
	},

	updateCustomer: async ({ request, locals }) => {
		const form = await request.formData();
		const customer = str(form, 'customer').trim();
		if (!customer) return fail(400, { message: 'Customer name is required.' });
		await database()
			.update(project)
			.set({ customer, customerDetail: str(form, 'detail'), updatedBy: actor(locals) })
			.where(eq(project.id, str(form, 'id')));
	},

	updateStatus: async ({ request, locals }) => {
		const form = await request.formData();
		const status = OPEN_STATUSES.find((s) => s === str(form, 'status'));
		// Won and Lost are set through their own actions.
		if (!status) return fail(400, { message: 'Invalid status.' });
		await database()
			.update(project)
			.set({ status, updatedBy: actor(locals) })
			.where(eq(project.id, str(form, 'id')));
	},

	updateNote: async ({ request, locals }) => {
		const form = await request.formData();
		await database()
			.update(project)
			.set({ note: str(form, 'note'), updatedBy: actor(locals) })
			.where(eq(project.id, str(form, 'id')));
	},

	winProject: async ({ request, locals }) => {
		const form = await request.formData();
		const closedOn = str(form, 'closedOn');
		const amount = Number(str(form, 'amount'));
		if (!DATE.test(closedOn)) return fail(400, { message: 'Invalid date.' });
		if (!Number.isFinite(amount) || amount < 0) return fail(400, { message: 'Invalid amount.' });
		await database()
			.update(project)
			.set({
				status: 'won',
				closedOn,
				amount: Math.round(amount * MINOR_UNIT),
				closeNote: str(form, 'note'),
				updatedBy: actor(locals),
			})
			.where(eq(project.id, str(form, 'id')));
	},

	loseProject: async ({ request, locals }) => {
		const form = await request.formData();
		const closedOn = str(form, 'closedOn');
		if (!DATE.test(closedOn)) return fail(400, { message: 'Invalid date.' });
		await database()
			.update(project)
			.set({
				status: 'lost',
				closedOn,
				amount: 0,
				closeNote: str(form, 'reason'),
				updatedBy: actor(locals),
			})
			.where(eq(project.id, str(form, 'id')));
	},

	deleteProject: async ({ request }) => {
		const form = await request.formData();
		const id = str(form, 'id');
		const db = database();
		await db.batch([db.delete(task).where(eq(task.projectId, id)), db.delete(project).where(eq(project.id, id))]);
	},

	addTask: async ({ request, locals }) => {
		const form = await request.formData();
		const title = str(form, 'title').trim();
		const dueDate = str(form, 'dueDate');
		if (!title) return fail(400, { message: 'Task title is required.' });
		if (!DATE.test(dueDate)) return fail(400, { message: 'Invalid due date.' });
		const db = database();
		const projectId = str(form, 'projectId');
		const exists = await db.select({ id: project.id }).from(project).where(eq(project.id, projectId)).get();
		if (!exists) return fail(404, { message: 'Project not found.' });
		const by = actor(locals);
		await db.insert(task).values({ projectId, title, dueDate, createdBy: by, updatedBy: by });
	},

	toggleTask: async ({ request, locals }) => {
		const form = await request.formData();
		const id = str(form, 'id');
		const db = database();
		const current = await db.select({ doneAt: task.doneAt }).from(task).where(eq(task.id, id)).get();
		if (!current) return fail(404, { message: 'Task not found.' });
		await db
			.update(task)
			.set({ doneAt: current.doneAt ? null : new Date(), updatedBy: actor(locals) })
			.where(eq(task.id, id));
	},

	deleteTask: async ({ request }) => {
		const form = await request.formData();
		await database().delete(task).where(eq(task.id, str(form, 'id')));
	}
};
