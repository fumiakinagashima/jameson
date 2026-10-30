import { fail } from '@sveltejs/kit';
import { env } from 'cloudflare:workers';
import { and, count, eq, inArray } from 'drizzle-orm';
import { getDb } from '../lib/server/db';
import { project, task } from '../lib/server/db/schema';
import { readForm } from '../lib/server/form';
import { parseListQuery } from '../lib/server/project-query';
import { MINOR_UNIT, PAGE_SIZE, projectLabel } from '../lib/project';
import { m } from '../lib/paraglide/messages.js';
import { forms } from '../lib/schemas';
import type { Actions, PageServerLoad } from './$types';

const database = () => getDb(env.DB);

const actor = (locals: App.Locals) => locals.user?.sub ?? null;

export const load: PageServerLoad = async ({ url }) => {
	const db = database();
	const { filter, sort, page: requestedPage, where, orderBy } = parseListQuery(url);

	const total = (await db.select({ total: count() }).from(project).where(where).get())?.total ?? 0;
	const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
	const page = Math.min(requestedPage, pageCount);

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
		.orderBy(...orderBy)
		.limit(PAGE_SIZE)
		.offset((page - 1) * PAGE_SIZE);

	const tasks = await db
		.select({
			id: task.id,
			projectId: task.projectId,
			projectName: project.name,
			title: task.title,
			dueDate: task.dueDate,
			doneAt: task.doneAt
		})
		.from(task)
		.innerJoin(project, eq(task.projectId, project.id));

	return {
		filter,
		sort,
		page,
		pageCount,
		total,
		projects,
		tasks: tasks.map(({ projectName, doneAt, ...t }) => ({
			...t,
			projectName: projectLabel({ name: projectName }),
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
				name: '',
				customer: '',
				createdBy: by,
				updatedBy: by
			});
	},

	updateProject: async ({ request, locals }) => {
		const input = readForm(forms.updateProject, await request.formData());
		if (!input.ok) return input.failure;
		const { id, name, detail } = input.data;
		await database()
			.update(project)
			.set({ name, projectDetail: detail, updatedBy: actor(locals) })
			.where(eq(project.id, id));
	},

	updateCustomer: async ({ request, locals }) => {
		const input = readForm(forms.updateCustomer, await request.formData());
		if (!input.ok) return input.failure;
		const { id, customer, detail } = input.data;
		await database()
			.update(project)
			.set({ customer, customerDetail: detail, updatedBy: actor(locals) })
			.where(eq(project.id, id));
	},

	updateStatus: async ({ request, locals }) => {
		const input = readForm(forms.updateStatus, await request.formData());
		if (!input.ok) return input.failure;
		const { id, status } = input.data;
		await database()
			.update(project)
			.set({ status, updatedBy: actor(locals) })
			.where(eq(project.id, id));
	},

	updateNote: async ({ request, locals }) => {
		const input = readForm(forms.updateNote, await request.formData());
		if (!input.ok) return input.failure;
		const { id, note } = input.data;
		await database()
			.update(project)
			.set({ note, updatedBy: actor(locals) })
			.where(eq(project.id, id));
	},

	winProject: async ({ request, locals }) => {
		const input = readForm(forms.winProject, await request.formData());
		if (!input.ok) return input.failure;
		const { id, closedOn, amount, note } = input.data;
		await database()
			.update(project)
			.set({
				status: 'won',
				closedOn,
				amount: Math.round(amount * MINOR_UNIT),
				closeNote: note,
				updatedBy: actor(locals)
			})
			.where(eq(project.id, id));
	},

	loseProject: async ({ request, locals }) => {
		const input = readForm(forms.loseProject, await request.formData());
		if (!input.ok) return input.failure;
		const { id, closedOn, reason } = input.data;
		await database()
			.update(project)
			.set({
				status: 'lost',
				closedOn,
				amount: 0,
				closeNote: reason,
				updatedBy: actor(locals)
			})
			.where(eq(project.id, id));
	},

	// Puts a won or lost project back in the open list, in Negotiation. What the close recorded
	// (date, amount, note) is cleared, because those fields hold values only for a closed project.
	reopenProject: async ({ request, locals }) => {
		const input = readForm(forms.byId, await request.formData());
		if (!input.ok) return input.failure;
		const { id } = input.data;
		await database()
			.update(project)
			.set({
				status: 'negotiation',
				closedOn: null,
				amount: 0,
				closeNote: '',
				updatedBy: actor(locals)
			})
			.where(and(eq(project.id, id), inArray(project.status, ['won', 'lost'])));
	},

	deleteProject: async ({ request }) => {
		const input = readForm(forms.byId, await request.formData());
		if (!input.ok) return input.failure;
		const { id } = input.data;
		const db = database();
		await db.batch([db.delete(task).where(eq(task.projectId, id)), db.delete(project).where(eq(project.id, id))]);
	},

	addTask: async ({ request, locals }) => {
		const input = readForm(forms.addTask, await request.formData());
		if (!input.ok) return input.failure;
		const { projectId, title, dueDate } = input.data;
		const db = database();
		const exists = await db.select({ id: project.id }).from(project).where(eq(project.id, projectId)).get();
		if (!exists) return fail(404, { message: m.project_not_found() });
		const by = actor(locals);
		await db.insert(task).values({ projectId, title, dueDate, createdBy: by, updatedBy: by });
	},

	toggleTask: async ({ request, locals }) => {
		const input = readForm(forms.byId, await request.formData());
		if (!input.ok) return input.failure;
		const { id } = input.data;
		const db = database();
		const current = await db.select({ doneAt: task.doneAt }).from(task).where(eq(task.id, id)).get();
		if (!current) return fail(404, { message: m.task_not_found() });
		await db
			.update(task)
			.set({ doneAt: current.doneAt ? null : new Date(), updatedBy: actor(locals) })
			.where(eq(task.id, id));
	},

	deleteTask: async ({ request }) => {
		const input = readForm(forms.byId, await request.formData());
		if (!input.ok) return input.failure;
		await database().delete(task).where(eq(task.id, input.data.id));
	}
};
