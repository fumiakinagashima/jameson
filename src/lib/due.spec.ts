import { describe, expect, it } from 'vitest';
import { dueLevel } from './due';

const today = '2026-10-30';

describe('dueLevel', () => {
	it('is null with no tasks or no due dates', () => {
		expect(dueLevel([], today)).toBeNull();
		expect(dueLevel([null, null], today)).toBeNull();
	});

	it('is overdue when a date is before today', () => {
		expect(dueLevel(['2026-10-29'], today)).toBe('overdue');
		expect(dueLevel(['2027-01-01', '2025-12-31'], today)).toBe('overdue');
	});

	it('is today when a date is today', () => {
		expect(dueLevel(['2026-10-30'], today)).toBe('today');
	});

	it('is soon for tomorrow', () => {
		expect(dueLevel(['2026-10-31'], today)).toBe('soon');
	});

	it('is null when every date is further away', () => {
		expect(dueLevel(['2026-11-01', '2027-01-01'], today)).toBeNull();
	});

	it('lets the most urgent win: overdue, then today, then soon', () => {
		expect(dueLevel(['2026-10-30', '2026-10-01'], today)).toBe('overdue');
		expect(dueLevel(['2026-10-31', '2026-10-30'], today)).toBe('today');
	});

	it('counts days across a month and a year end', () => {
		expect(dueLevel(['2027-01-01'], '2026-12-31')).toBe('soon');
		expect(dueLevel(['2026-11-01'], '2026-10-31')).toBe('soon');
		expect(dueLevel(['2027-01-02'], '2026-12-31')).toBeNull();
	});
});
