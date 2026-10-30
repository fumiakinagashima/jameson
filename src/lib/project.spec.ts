import { describe, expect, it } from 'vitest';
import { projectLabel } from './project';

describe('projectLabel', () => {
	it('shows the project name', () => {
		expect(projectLabel({ name: 'Website' })).toBe('Website');
	});

	it('says "Not set" when there is no project name, even if the customer is known', () => {
		expect(projectLabel({ name: '' })).toBe('Not set');
	});
});
