import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { exportJWK, generateKeyPair, SignJWT } from 'jose';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { verifyAccessJwt } from './access';

const AUD = 'test-aud-tag';

type SigningKey = Awaited<ReturnType<typeof generateKeyPair>>['privateKey'];
type Options = {
	kid?: string;
	issuer?: string;
	audience?: string | string[];
	// null leaves the expiry out of the token.
	expires?: string | number | null;
	notBefore?: number;
};

let server: Server;
let teamDomain: string;
let privateKey: SigningKey;
let certsRequests = 0;

// A stand-in for `https://<team>.cloudflareaccess.com/cdn-cgi/access/certs`.
beforeAll(async () => {
	const keys = await generateKeyPair('RS256', { extractable: true });
	privateKey = keys.privateKey;
	const jwk = { ...(await exportJWK(keys.publicKey)), kid: 'k1', alg: 'RS256', use: 'sig' };

	server = createServer((req, res) => {
		if (req.url !== '/cdn-cgi/access/certs') {
			res.statusCode = 404;
			res.end();
			return;
		}
		certsRequests++;
		res.setHeader('content-type', 'application/json');
		res.end(JSON.stringify({ keys: [jwk] }));
	});
	await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
	teamDomain = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())));

const sign = (claims: Record<string, unknown> = {}, o: Options = {}) => {
	let jwt = new SignJWT(claims)
		.setProtectedHeader({ alg: 'RS256', kid: o.kid ?? 'k1' })
		.setIssuer(o.issuer ?? teamDomain)
		.setAudience(o.audience ?? [AUD])
		.setIssuedAt();
	if (o.expires !== null) jwt = jwt.setExpirationTime(o.expires ?? '5m');
	if (o.notBefore) jwt = jwt.setNotBefore(o.notBefore);
	return jwt.sign(privateKey);
};

const verify = (token: string) => verifyAccessJwt(token, teamDomain, AUD);

describe('verifyAccessJwt', () => {
	// This test runs first on purpose: it counts the requests for the keys.
	it('accepts a valid token and fetches the keys only once', async () => {
		const user = await verify(await sign({ sub: 'user-1', email: 'me@example.com' }));
		expect(user).toEqual({ sub: 'user-1', email: 'me@example.com' });

		await verify(await sign({ sub: 'user-2' }));
		expect(certsRequests).toBe(1);
	});

	it('accepts the audience as a single string too', async () => {
		const user = await verify(await sign({ sub: 'user-1' }, { audience: AUD }));
		expect(user.sub).toBe('user-1');
	});

	it('treats a service token (empty sub, no email) as no user', async () => {
		const user = await verify(await sign({ sub: '', common_name: 'ci.access' }));
		expect(user).toEqual({ sub: null, email: null });
	});

	it('rejects an expired token', async () => {
		const expired = Math.floor(Date.now() / 1000) - 10;
		await expect(verify(await sign({}, { expires: expired }))).rejects.toThrow(/exp/);
	});

	it('rejects a token without an expiry', async () => {
		await expect(verify(await sign({}, { expires: null }))).rejects.toThrow(/exp/);
	});

	it('rejects a token that is not valid yet', async () => {
		const later = Math.floor(Date.now() / 1000) + 600;
		await expect(verify(await sign({}, { notBefore: later }))).rejects.toThrow(/nbf/);
	});

	it('rejects a token for another application', async () => {
		await expect(verify(await sign({}, { audience: ['someone-elses-app'] }))).rejects.toThrow(/aud/);
	});

	it('rejects a token from another team', async () => {
		const other = 'https://other.cloudflareaccess.com';
		await expect(verify(await sign({}, { issuer: other }))).rejects.toThrow(/iss/);
	});

	it('rejects a token signed with an unknown key', async () => {
		await expect(verify(await sign({}, { kid: 'unknown' }))).rejects.toThrow();
	});

	it('rejects a token whose payload was changed after signing', async () => {
		const [header, , signature] = (await sign({ sub: 'user-1' })).split('.');
		const forged = Buffer.from(
			JSON.stringify({ sub: 'admin', iss: teamDomain, aud: [AUD], exp: Math.floor(Date.now() / 1000) + 600 })
		).toString('base64url');
		await expect(verify(`${header}.${forged}.${signature}`)).rejects.toThrow(/signature/);
	});

	it('rejects an unsigned token', async () => {
		const [, payload] = (await sign()).split('.');
		const header = Buffer.from(JSON.stringify({ alg: 'none' })).toString('base64url');
		await expect(verify(`${header}.${payload}.`)).rejects.toThrow();
	});

	it('rejects something that is not a token', async () => {
		await expect(verify('not-a-token')).rejects.toThrow();
	});
});
