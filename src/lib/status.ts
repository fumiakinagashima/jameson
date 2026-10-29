import { m } from './paraglide/messages.js';
import type { Locale } from './paraglide/runtime.js';

// Shared by the DB schema (server) and the UI (client), so it must not live under `server/`.
export const PROJECT_STATUSES = ['lead', 'proposal', 'negotiation', 'pending', 'won', 'lost'] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

const LABELS = {
	lead: m.status_lead,
	proposal: m.status_proposal,
	negotiation: m.status_negotiation,
	pending: m.status_pending,
	won: m.status_won,
	lost: m.status_lost
} satisfies Record<ProjectStatus, unknown>;

// The label in the language of the current request. Pass a locale to pin it (the CSV export
// always uses English, so a file reads the same whatever the browser's language is).
export const statusLabel = (status: ProjectStatus, locale?: Locale) =>
	LABELS[status]({}, locale ? { locale } : undefined);

// Statuses that can be picked directly. Won and Lost are set from the row menu dialogs.
export const OPEN_STATUSES = PROJECT_STATUSES.filter(
	(s): s is Exclude<ProjectStatus, 'won' | 'lost'> => s !== 'won' && s !== 'lost'
);
