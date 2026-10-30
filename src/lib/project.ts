import { m } from './paraglide/messages.js';
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

// The list can be sorted by these columns (`?sort=` and `?dir=`). No sort means newest first.
export const SORT_KEYS = ['project', 'customer', 'status'] as const;
export type SortKey = (typeof SORT_KEYS)[number];
export type Sort = { key: SortKey; dir: 'asc' | 'desc' } | null;

// The amount is stored in minor currency units. Until the currency becomes a setting,
// assume two decimal places.
export const MINOR_UNIT = 100;

// Projects per page of the list. The CSV export ignores it and holds every project.
export const PAGE_SIZE = 50;

// The project name is optional. A project without one is shown as "Not set" (the table also
// dims it), so a title or a dialog never ends up blank.
export const projectLabel = (p: Pick<ProjectRow, 'name'>) => p.name || m.not_set();
