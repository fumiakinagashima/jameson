import { createRemoteJWKSet, jwtVerify } from "jose";

export type AccessUser = {
    // `sub` claim. Null for service tokens, which have no user behind them.
    sub: string | null;
    email: string | null;
};

let jwks: ReturnType<typeof createRemoteJWKSet> | undefined;

export const verifyAccessJwt = async (
    token: string,
    teamDomain: string,
    audience: string
): Promise<AccessUser> => {
    jwks ??= createRemoteJWKSet(new URL(`${teamDomain}/cdn-cgi/access/certs`));
    const { payload } = await jwtVerify(token, jwks, {
        issuer: teamDomain,
        audience,
        algorithms: ['RS256'],
        requiredClaims: ['exp'],
    });
    return {
        sub: payload.sub || null,
        email: typeof payload.email === 'string' ? payload.email : null,
    };
};