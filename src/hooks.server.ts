import { dev } from '$app/env';
import { error } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit/hooks';
import { env } from 'node:process';
import { verifyAccessJwt } from '#lib/server/access.ts';

export const handle: Handle = async ({ event, resolve }) => {
    event.locals.user = null;

    // No Access in front of `vite dev`, so verification only runs once deployed.
    if (!dev) {
        const token = event.request.headers.get('cf-access-jwt-assertion');
        if (!token) error(403, 'Missing Access token');
        try {
            event.locals.user = await verifyAccessJwt(token, env.ACCESS_TEAM_DOMAIN, env.ACCESS_AUD);
        } catch (e) {
            console.warn('Access JWT rejected:', e);
            error(403, 'Invalid Access token');
        }
    }

    return resolve(event);
};