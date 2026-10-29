# Jameson

A micro sales force automation (SFA) tool that runs entirely on Cloudflare. One page, one list, a few dialogs.

You deploy it to your own Cloudflare account, so your data stays in your own database and nobody else runs it for you.

> **Status: alpha.** It works end to end, but expect rough edges and breaking changes. See [Limitations](#limitations).

## What it does

- **One list of projects** with customer, status and a note. Details open in dialogs, so the page stays small.
- **Statuses**: Lead, Proposal, Negotiation, Pending (open), and Won, Lost (closed).
  - Won and Lost are set from the row menu (`...`), where you enter the date and the amount or the reason.
- **Tasks per project**: next actions with a due date. Done tasks stay as a history. A cross-project task list is one click away.
- **Filter**: free-text search over names, notes and details, plus a status filter. The filter lives in the URL, so a filtered view can be bookmarked or shared.
- **CSV export** of whatever the list is showing.
- **Sign-in with Cloudflare Access**: no passwords or user tables in the app. The header shows who is signed in, with a logout link.

### What it deliberately does not do

Jameson is for teams of about 1 to 5 people, so some usual CRM features are left out on purpose: no owner/assignee field, no win-probability forecast, no user management, no quotes or invoices. Everyone sees every project.

## Tech stack

- [SvelteKit](https://svelte.dev/docs/kit) 3 (Svelte 5) on Cloudflare Workers
- [Cloudflare D1](https://developers.cloudflare.com/d1/) with [Drizzle ORM](https://orm.drizzle.team/)
- [Cloudflare Access](https://developers.cloudflare.com/cloudflare-one/access-controls/) for sign-in; the Worker verifies the Access JWT with [jose](https://github.com/panva/jose)
- TypeScript, SCSS, Bun

## Requirements

- [Bun](https://bun.sh/)
- Node.js 22.17 or later (Wrangler and SvelteKit need it). `.node-version` pins Node 24 for CI.
- A Cloudflare account (the free plan is enough to try it)

The npm scripts use `rm -rf`, so use Linux, macOS or WSL. Jameson is developed on WSL2.

## Run it locally

```sh
bun install
bunx wrangler d1 migrations apply DB --local
bun run dev
```

Open the URL that Vite prints. Locally there is no Cloudflare Access in front of the app, so the sign-in check is skipped and the header shows no user. The local database lives in `.wrangler/` and you can delete it any time.

## Deploy to your Cloudflare account

### What to change in `wrangler.jsonc`

The values committed in this repository belong to the author's own deployment. Replace them with yours:

| Field | Change it to | Needed |
| --- | --- | --- |
| `d1_databases[0].database_id` | The id printed by `wrangler d1 create` (step 2) | Always |
| `d1_databases[0].database_name` | The name you gave the database | Only if it is not `jameson` |
| `vars.ACCESS_TEAM_DOMAIN` | `https://<team-name>.cloudflareaccess.com` (step 5) | Always |
| `vars.ACCESS_AUD` | The Access application's AUD tag (step 5) | Always |
| `workers_dev` | `true` | If you use the `workers.dev` URL (step 3) |
| `name` | Any Worker name | Optional |
| `preview_urls` | Leave it `false`, so preview URLs do not become a second way in | Never |

Do these in order. Until step 6 is done, the deployed app answers every request with `403`, so nothing is exposed while you set things up.

1. **Log in to Cloudflare**

   ```sh
   bunx wrangler login
   ```

2. **Create the database**, then copy the `database_id` it prints into `wrangler.jsonc`.

   ```sh
   bunx wrangler d1 create jameson
   ```

3. **Decide where the app will live.**
   - On `workers.dev`: set `"workers_dev": true` in `wrangler.jsonc`.
   - On your own domain: keep `"workers_dev": false` and attach the domain to the Worker after step 4 (Workers & Pages, your Worker, Settings, Domains & Routes).

4. **Build and deploy.** `bun run deploy` does everything in one go: it builds the app, applies the database migrations to your remote database, then deploys the Worker.

   ```sh
   bun run deploy
   ```

5. **Protect it with Cloudflare Access.** Dashboard labels change from time to time, so look for the names in quotes.
   - Open Zero Trust and finish the first-time setup. You choose a team name, which becomes `https://<team-name>.cloudflareaccess.com`. The free plan may ask for a payment method.
   - If you want people to sign in with an emailed code, add "One-time PIN" under Integrations, Identity providers. It is not enabled by default.
   - Put the Worker behind Access. For `workers.dev`, open the Worker's Settings, Domains & Routes, and manage its Access settings; use the scope "All traffic". For your own domain, create a self-hosted application for that hostname. Add an "Allow" policy that lists the email addresses that may sign in.

6. **Tell the app which Access application to trust.** In `wrangler.jsonc`, set:

   ```jsonc
   "vars": {
     "ACCESS_TEAM_DOMAIN": "https://<team-name>.cloudflareaccess.com",
     "ACCESS_AUD": "<Application Audience (AUD) Tag>"
   }
   ```

   The AUD tag is shown in the Access application's settings, under "Application Audience (AUD) Tag". Then deploy again:

   ```sh
   bun run deploy
   ```

Open your URL, sign in through Access, and you should see the list.

### Configuration

| Setting | Where | Meaning |
| --- | --- | --- |
| `ACCESS_TEAM_DOMAIN` | `wrangler.jsonc` `vars` | Your Zero Trust team domain. Must match the `iss` claim of the Access JWT. |
| `ACCESS_AUD` | `wrangler.jsonc` `vars` | The Access application's AUD tag. Must match the `aud` claim. |
| `DB` | `wrangler.jsonc` `d1_databases` | The D1 binding. |

If the team domain or the AUD tag is wrong, every request is rejected with `403`. Run `bunx wrangler tail` while you load the page to see why (for example `unexpected "aud" claim value`).

## Development

```sh
bun run dev        # dev server with a local D1 database
bun run check      # types: wrangler types + svelte-check
bun run lint       # ESLint
bun run build      # production build
bun run preview    # run the build in the Workers runtime (requests need an Access token, so you will see 403)
bun run deploy     # build, apply migrations to the remote database, then deploy
```

- `build`, `check` and `gen` delete `.svelte-kit/cloudflare` first. Run `bun run build` again before `preview`.
- After adding or changing a binding in `wrangler.jsonc`, run `bun run gen` to regenerate `worker-configuration.d.ts`. Changing the values under `vars` needs no regeneration.
- Local secrets go in `.dev.vars` (git-ignored). Production secrets are set with `wrangler secret put`.
- The database schema is in `src/lib/server/db/schema.ts`. After changing it, create a migration with `bun run db:generate` (it needs `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_DATABASE_ID` and `CLOUDFLARE_D1_TOKEN` set; see `.env.example`), then apply it with `wrangler d1 migrations apply`.

### Notes on the data

- Timestamps (`created_at`, `updated_at`, ...) are stored in UTC. Dates that a person picks, such as the due date or the won/lost date, are stored as plain `YYYY-MM-DD` with no time zone.
- Amounts are stored in minor units (for example cents), assuming two decimal places, and are only set when a project is won.
- `created_by` and `updated_by` hold the Access user id (`sub`), not an email address. They are not shown in the UI or in the CSV.

## Limitations

This is an alpha. Known gaps:

- English UI only. There is no i18n yet.
- The currency is not configurable; amounts assume two decimal places.
- A Won or Lost project cannot be reopened yet.
- No highlighting or reminders for tasks that are due soon.
- No file attachments.
- No automated tests beyond type checking and linting.
- The app has not had a security review. It relies on Cloudflare Access in front of it and verifies the Access token on every request, but run it with real customer data at your own risk.

## Feedback

Bug reports and ideas are welcome as GitHub issues. Jameson is meant to stay small, so a feature may be declined if it makes the tool bigger than a handful of people need.

## License

[MIT](./LICENSE)
