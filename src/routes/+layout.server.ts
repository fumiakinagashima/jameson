import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = ({ locals }) => ({
    // Only what the header shows. The `sub` stays on the server.
    user: locals.user?.email ? { email: locals.user.email } : null
});