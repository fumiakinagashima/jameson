import type { ProjectStatus } from './status';

export type ProjectRow = {
	id: string;
	name: string;
	customer: string;
	status: ProjectStatus;
	note: string;
	projectDetail: string;
	customerDetail: string;
};

// The amount is stored in minor currency units. Until the currency becomes a setting,
// assume two decimal places.
export const MINOR_UNIT = 100;

// The project name is optional; fall back to the customer name.
export const projectLabel = (p: Pick<ProjectRow, 'name' | 'customer'>) => p.name || p.customer;
