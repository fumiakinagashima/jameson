import { readFile } from 'node:fs/promises';
import { expect, test, type Page } from '@playwright/test';

// Names are unique per test, so a test finds its own rows among those the others left behind.
let counter = 0;
const unique = (label: string) => `${label}-${Date.now()}-${counter++}`;

// Opens the page and waits until it has loaded its scripts. A click before the page is
// interactive does nothing, which would look like a bug in the app.
const open = async (page: Page) => {
	await page.goto('/');
	await page.waitForLoadState('networkidle');
};

const rowOf = (page: Page, text: string) => page.getByRole('row').filter({ hasText: text });

const filterBy = async (page: Page, text: string) => {
	await page.getByLabel('Filter text').fill(text);
	await expect(page).toHaveURL(new RegExp(`q=${encodeURIComponent(text)}`));
};

// Creates a project from the Create button, then names it and its customer in the dialogs.
const createProject = async (page: Page, name: string, customer = name) => {
	await open(page);
	await page.getByRole('button', { name: 'Create' }).click();

	// A new project has no names yet, and the newest project is the first row.
	const created = page.getByRole('row').nth(1);
	await expect(created.getByRole('button', { name: 'Not set' })).toHaveCount(2);
	await created.getByRole('button', { name: 'Not set' }).first().click();
	await page.getByPlaceholder('Input project name').fill(name);
	await page.getByRole('button', { name: 'OK' }).click();

	const renamed = rowOf(page, name);
	await expect(renamed).toHaveCount(1);
	await renamed.getByRole('button', { name: 'Not set' }).click();
	await page.getByPlaceholder('Input customer name').fill(customer);
	await page.getByRole('button', { name: 'OK' }).click();
	await expect(renamed.getByRole('button', { name: customer, exact: true })).toBeVisible();
};

// Let the page finish what it is loading before the browser closes, so a request is not cut off.
test.afterEach(async ({ page }) => {
	await page.waitForLoadState('networkidle');
});

test('the page is in English and lists projects', async ({ page }) => {
	await open(page);
	await expect(page.locator('html')).toHaveAttribute('lang', 'en');
	await expect(page).toHaveTitle('JAMESON | Micro SFA');
	await expect(page.getByRole('button', { name: 'CSV Download' })).toBeVisible();
});

test('a project keeps its note and status after a reload', async ({ page }) => {
	const name = unique('note');
	await createProject(page, name);

	const row = rowOf(page, name);
	const saved = (action: string) => page.waitForResponse((r) => r.url().includes(`/${action}`));

	// Each change is saved when the field loses focus or changes; wait for the server's answer,
	// or the reload below could cut the request off.
	await row.getByRole('textbox').fill('Waiting for a quote');
	await Promise.all([saved('updateNote'), row.getByRole('textbox').blur()]);
	await page.waitForLoadState('networkidle');
	await Promise.all([saved('updateStatus'), row.getByRole('combobox').selectOption('proposal')]);
	await page.waitForLoadState('networkidle');

	await page.reload();
	await page.waitForLoadState('networkidle');
	await expect(row.getByRole('textbox')).toHaveValue('Waiting for a quote');
	await expect(row.getByRole('combobox')).toHaveValue('proposal');
});

test('tasks can be added and checked off', async ({ page }) => {
	const name = unique('task');
	await createProject(page, name);

	const row = rowOf(page, name);
	const openTasks = row.getByRole('button', { name: /^\d+$/ });
	await expect(openTasks).toHaveText('0');

	await openTasks.click();
	const dialog = page.getByRole('dialog');
	await dialog.getByPlaceholder('Add a task').fill('Call them back');
	await dialog.getByRole('button', { name: 'Add', exact: true }).click();
	await expect(dialog.getByText('Call them back')).toBeVisible();

	await dialog.getByRole('checkbox').check();
	await dialog.getByRole('button', { name: 'Close' }).click();
	// A task that is done is no longer counted.
	await expect(openTasks).toHaveText('0');
});

test('the list can be filtered by text and cleared', async ({ page }) => {
	const first = unique('filter-a');
	const second = unique('filter-b');
	await createProject(page, first);
	await createProject(page, second);

	await filterBy(page, first);
	await expect(rowOf(page, first)).toHaveCount(1);
	await expect(rowOf(page, second)).toHaveCount(0);

	await page.getByRole('button', { name: 'Clear search condition' }).click();
	await expect(page.getByLabel('Filter text')).toHaveValue('');
	await expect(rowOf(page, second)).toHaveCount(1);
});

test('clicking a column header cycles ascending, descending and the default order', async ({ page }) => {
	const prefix = unique('sort');
	// Created in this order, so the default order (newest first) is Gamma, alpha, Beta.
	await createProject(page, `${prefix}-1`, `${prefix}-Beta`);
	await createProject(page, `${prefix}-2`, `${prefix}-alpha`);
	await createProject(page, `${prefix}-3`, `${prefix}-Gamma`);
	await filterBy(page, prefix);

	const customers = () => page.getByRole('row').getByRole('button', { name: /-(Beta|alpha|Gamma)$/ }).allTextContents();
	const header = page.getByRole('columnheader', { name: 'Customer' });
	const strip = (names: string[]) => names.map((n) => n.replace(`${prefix}-`, ''));

	await expect.poll(async () => strip(await customers())).toEqual(['Gamma', 'alpha', 'Beta']);

	await header.getByRole('button').click();
	await expect(header).toHaveAttribute('aria-sort', 'ascending');
	await expect.poll(async () => strip(await customers())).toEqual(['alpha', 'Beta', 'Gamma']);

	await header.getByRole('button').click();
	await expect(header).toHaveAttribute('aria-sort', 'descending');
	await expect.poll(async () => strip(await customers())).toEqual(['Gamma', 'Beta', 'alpha']);

	await header.getByRole('button').click();
	await expect(header).toHaveAttribute('aria-sort', 'none');
	await expect.poll(async () => strip(await customers())).toEqual(['Gamma', 'alpha', 'Beta']);
});

test('a won project leaves the open list and shows up under Won', async ({ page }) => {
	const name = unique('won');
	await createProject(page, name);

	await rowOf(page, name).getByRole('button', { name: 'Commands' }).click();
	await page.getByRole('menuitem', { name: 'Won' }).click();
	const dialog = page.getByRole('dialog');
	await dialog.getByLabel('Amount').fill('1200');
	await dialog.getByRole('button', { name: 'OK' }).click();

	// The list shows open projects by default.
	await expect(rowOf(page, name)).toHaveCount(0);

	await page.locator('#status').selectOption('won');
	await expect(rowOf(page, name)).toHaveCount(1);
	await expect(rowOf(page, name).getByText('Won', { exact: true })).toBeVisible();
});

test('a lost project can be reopened and returns to the open list', async ({ page }) => {
	const name = unique('reopen');
	await createProject(page, name);

	await rowOf(page, name).getByRole('button', { name: 'Commands' }).click();
	await page.getByRole('menuitem', { name: 'Lost' }).click();
	await page.getByRole('dialog').getByRole('button', { name: 'OK' }).click();
	await expect(rowOf(page, name)).toHaveCount(0);

	await page.locator('#status').selectOption('lost');
	const row = rowOf(page, name);
	await expect(row).toHaveCount(1);
	await row.getByRole('button', { name: 'Commands' }).click();
	// A closed project cannot be closed again, only reopened.
	await expect(page.getByRole('menuitem', { name: 'Won' })).toHaveCount(0);
	await page.getByRole('menuitem', { name: 'Reopen' }).click();
	await expect(row).toHaveCount(0);

	await page.locator('#status').selectOption('');
	await expect(rowOf(page, name)).toHaveCount(1);
	await expect(rowOf(page, name).locator('select')).toHaveValue('negotiation');
});

test('a project can be deleted after a confirmation', async ({ page }) => {
	const name = unique('delete');
	await createProject(page, name);

	await rowOf(page, name).getByRole('button', { name: 'Commands' }).click();
	await page.getByRole('menuitem', { name: 'Delete' }).click();
	const dialog = page.getByRole('dialog');
	await expect(dialog.getByText(name)).toBeVisible();
	await dialog.getByRole('button', { name: 'Delete' }).click();

	await expect(rowOf(page, name)).toHaveCount(0);
});

test('the CSV download holds what the list shows', async ({ page }) => {
	const name = unique('csv');
	await createProject(page, name);
	await filterBy(page, name);

	const [download] = await Promise.all([
		page.waitForEvent('download'),
		page.getByRole('button', { name: 'CSV Download' }).click()
	]);
	expect(download.suggestedFilename()).toMatch(/^jameson-projects-\d{4}-\d{2}-\d{2}\.csv$/);

	const csv = await readFile((await download.path())!, 'utf8');
	const [header, ...rows] = csv.replace(/^\uFEFF/, '').trim().split('\r\n');
	expect(header.split(',')[0]).toBe('Project');
	expect(rows).toHaveLength(1);
	expect(rows[0]).toContain(name);
});

test('a project without names shows a dimmed "Not set"', async ({ page }) => {
	await open(page);
	await page.getByRole('button', { name: 'Create' }).click();

	const created = page.getByRole('row').nth(1);
	const notSet = created.getByText('Not set');
	// Both the project and the customer are blank, and each can still be clicked to fill in.
	await expect(notSet).toHaveCount(2);
	await expect(notSet.first()).toHaveCSS('color', 'rgb(170, 170, 170)');

	// A customer name does not stand in for the missing project name.
	const customer = unique('notset-customer');
	await created.getByRole('button', { name: 'Not set' }).last().click();
	await page.getByPlaceholder('Input customer name').fill(customer);
	await page.getByRole('button', { name: 'OK' }).click();
	const row = rowOf(page, customer);
	await expect(row.getByRole('button', { name: 'Not set' })).toHaveCount(1);
	await expect(row.getByRole('button', { name: customer, exact: true })).toHaveCount(1);

	// Name it, so this row does not stay blank for the tests that look at the first row.
	const name = unique('notset');
	await row.getByRole('button', { name: 'Not set' }).click();
	await page.getByPlaceholder('Input project name').fill(name);
	await page.getByRole('button', { name: 'OK' }).click();
	await expect(rowOf(page, name)).toHaveCount(1);
	await expect(rowOf(page, name).getByRole('button', { name: 'Not set' })).toHaveCount(0);
});

// Last, because it leaves many blank projects behind, and the other tests expect the project
// they just created to be the first row.
test('the list is paged, and the CSV holds every page', async ({ page }) => {
	await open(page);
	for (let i = 0; i < 51; i++) {
		// SvelteKit only takes an action as a form, so the request needs a body.
		const res = await page.request.post('/?/createProject', {
			headers: { Origin: 'http://localhost:4174', 'x-sveltekit-action': 'true' },
			form: { create: '1' }
		});
		expect(res.status()).toBe(200);
	}
	await page.reload();
	await page.waitForLoadState('networkidle');

	// A header row and 50 projects.
	await expect(page.getByRole('row')).toHaveCount(51);
	const range = page.getByText(/^1–50 of \d+$/);
	await expect(range).toBeVisible();
	const total = Number((await range.textContent())!.split(' of ')[1]);
	expect(total).toBeGreaterThanOrEqual(51);

	const previous = page.getByRole('button', { name: 'Previous page' });
	const next = page.getByRole('button', { name: 'Next page' });
	await expect(previous).toBeDisabled();

	await next.click();
	await expect(page).toHaveURL(/page=2/);
	await expect(page.getByText(new RegExp(`^51–${Math.min(100, total)} of ${total}$`))).toBeVisible();
	await expect(previous).toBeEnabled();

	await previous.click();
	await expect(page).not.toHaveURL(/page=/);
	await expect(range).toBeVisible();

	// The download holds all of them, whichever page the list is on.
	await next.click();
	await expect(page).toHaveURL(/page=2/);
	const [download] = await Promise.all([
		page.waitForEvent('download'),
		page.getByRole('button', { name: 'CSV Download' }).click()
	]);
	const csv = await readFile((await download.path())!, 'utf8');
	const [, ...rows] = csv.replace(/^\uFEFF/, '').trim().split('\r\n');
	expect(rows).toHaveLength(total);
});
