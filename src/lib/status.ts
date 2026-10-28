// Shared by the DB schema (server) and the UI (client), so it must not live under `server/`.
export const PROJECT_STATUSES = ['lead', 'proposal', 'negotiation', 'pending', 'won', 'lost'] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const STATUS_LABELS: Record<ProjectStatus, string> = {
	lead: 'Lead',
	proposal: 'Proposal',
	negotiation: 'Negotiation',
	pending: 'Pending',
	won: 'Won',
	lost: 'Lost'
};

// Statuses that can be picked directly. Won and Lost are set from the row menu dialogs.
export const OPEN_STATUSES = PROJECT_STATUSES.filter(
	(s): s is Exclude<ProjectStatus, 'won' | 'lost'> => s !== 'won' && s !== 'lost'
);
