import { defineConfig } from '@playwright/test';

const PORT = 4174;

export default defineConfig({
	testDir: 'e2e',
	testMatch: '**/*.e2e.ts',
	// The tests share one database, so they run one at a time.
	workers: 1,
	use: { baseURL: `http://localhost:${PORT}`, locale: 'en-US' },
	webServer: {
		// A dev server, so no Cloudflare Access sits in front of it and no sign-in is needed.
		// It gets a fresh local database of its own on every run (see vite.config.ts).
		command:
			`rm -rf .wrangler/e2e && npx wrangler d1 migrations apply DB --local --persist-to .wrangler/e2e` +
			` && E2E=1 npx vite dev --port ${PORT} --strictPort`,
		url: `http://localhost:${PORT}`,
		reuseExistingServer: false,
		timeout: 120_000
	}
});
