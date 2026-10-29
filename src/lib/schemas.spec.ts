import { describe, expect, it } from 'vitest';
import { forms } from './schemas';

// The message of the first problem, or null when the input is fine.
const problem = (schema: { safeParse: (input: unknown) => { success: boolean; error?: { issues: { message: string }[] } } }, input: unknown) => {
	const result = schema.safeParse(input);
	return result.success ? null : (result.error?.issues[0].message ?? null);
};

describe('every action that takes an id', () => {
	it('needs one', () => {
		expect(problem(forms.byId, {})).toBe('Invalid request.');
		expect(problem(forms.byId, { id: '' })).toBe('Invalid request.');
		expect(problem(forms.byId, { id: 'seed-p1' })).toBeNull();
	});
});

describe('updateProject', () => {
	it('trims the name and defaults the missing fields', () => {
		expect(forms.updateProject.parse({ id: 'x', name: '  Website  ' })).toEqual({
			id: 'x',
			name: 'Website',
			detail: ''
		});
	});

	it('limits the length of the name and of the detail', () => {
		expect(problem(forms.updateProject, { id: 'x', name: 'x'.repeat(201) })).toBe('Project name is too long.');
		expect(problem(forms.updateProject, { id: 'x', detail: 'x'.repeat(10_001) })).toBe('Detail is too long.');
		expect(problem(forms.updateProject, { id: 'x', name: 'x'.repeat(200), detail: 'x'.repeat(10_000) })).toBeNull();
	});
});

describe('updateCustomer', () => {
	it('needs a customer name that is not only spaces', () => {
		expect(problem(forms.updateCustomer, { id: 'x', customer: '   ' })).toBe('Customer name is required.');
		expect(problem(forms.updateCustomer, { id: 'x' })).not.toBeNull();
		expect(forms.updateCustomer.parse({ id: 'x', customer: ' Acme ' }).customer).toBe('Acme');
	});
});

describe('updateStatus', () => {
	it('takes the open statuses only; won and lost have their own actions', () => {
		for (const status of ['lead', 'proposal', 'negotiation', 'pending']) {
			expect(problem(forms.updateStatus, { id: 'x', status })).toBeNull();
		}
		expect(problem(forms.updateStatus, { id: 'x', status: 'won' })).toBe('Invalid status.');
		expect(problem(forms.updateStatus, { id: 'x', status: 'lost' })).toBe('Invalid status.');
		expect(problem(forms.updateStatus, { id: 'x' })).toBe('Invalid status.');
	});
});

describe('winProject', () => {
	const valid = { id: 'x', closedOn: '2026-10-29', amount: '12.5' };

	it('turns the amount into a number', () => {
		expect(forms.winProject.parse(valid)).toEqual({ ...valid, amount: 12.5, note: '' });
		expect(forms.winProject.parse({ ...valid, amount: '' }).amount).toBe(0);
	});

	it('needs a date that exists', () => {
		expect(problem(forms.winProject, { ...valid, closedOn: '2026-02-30' })).toBe('Invalid date.');
		expect(problem(forms.winProject, { ...valid, closedOn: '2026-1-1' })).toBe('Invalid date.');
		expect(problem(forms.winProject, { ...valid, closedOn: '' })).toBe('Invalid date.');
		expect(problem(forms.winProject, { ...valid, closedOn: '2028-02-29' })).toBeNull();
	});

	it('rejects an amount that is not a sensible number', () => {
		for (const amount of ['abc', '-1', 'Infinity', '1e13']) {
			expect(problem(forms.winProject, { ...valid, amount })).toBe('Invalid amount.');
		}
	});
});

describe('loseProject', () => {
	it('needs a date, and the reason is optional', () => {
		expect(problem(forms.loseProject, { id: 'x', closedOn: '2026-10-29' })).toBeNull();
		expect(problem(forms.loseProject, { id: 'x' })).toBe('Invalid date.');
	});
});

describe('addTask', () => {
	const valid = { projectId: 'p1', title: 'Call them', dueDate: '2026-11-01' };

	it('trims the title', () => {
		expect(forms.addTask.parse({ ...valid, title: '  Call them  ' }).title).toBe('Call them');
	});

	it('needs a title, a project and a due date that exists', () => {
		expect(problem(forms.addTask, { ...valid, title: '  ' })).toBe('Task title is required.');
		expect(problem(forms.addTask, { ...valid, projectId: '' })).toBe('Invalid request.');
		expect(problem(forms.addTask, { ...valid, dueDate: 'tomorrow' })).toBe('Invalid due date.');
		expect(problem(forms.addTask, { ...valid, dueDate: '2026-02-30' })).toBe('Invalid due date.');
	});
});
