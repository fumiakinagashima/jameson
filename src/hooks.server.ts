import { getTextDirection } from './lib/paraglide/runtime.js';
import { paraglideMiddleware } from './lib/paraglide/server.js';
import { dev } from '$app/env';
import { error } from '@sveltejs/kit';
import { type Handle, sequence } from '@sveltejs/kit/hooks';
import { env } from 'node:process';
import { verifyAccessJwt } from '#lib/server/access.ts';

const accessHandle: Handle = async ({ event, resolve }) => {
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

// Picks the language of the request and fills it into app.html.
const languageHandle: Handle = ({ event, resolve }) =>
    paraglideMiddleware(event.request, ({ request, locale }) =>
        resolve(
            { ...event, request },
            {
                transformPageChunk: ({ html }) =>
                    html
                        .replace('%paraglide.lang%', locale)
                        .replace('%paraglide.dir%', getTextDirection(locale))
            }
        )
    );

// Access is checked first, so a request that is not allowed in never reaches the rest.
export const handle = sequence(accessHandle, languageHandle);
