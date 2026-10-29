import { fail } from '@sveltejs/kit';
import type { z } from 'zod';

// Validates what a form action received. When something is wrong, `failure` carries the
// first problem as the message the page shows.
export const readForm = <T extends z.ZodType>(schema: T, form: FormData) => {
	const result = schema.safeParse(Object.fromEntries(form));
	return result.success
		? ({ ok: true, data: result.data } as const)
		: ({ ok: false, failure: fail(400, { message: result.error.issues[0].message }) } as const);
};
