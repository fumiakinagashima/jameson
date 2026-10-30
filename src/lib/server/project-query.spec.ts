import { describe, expect, it } from 'vitest';
import { parseListQuery } from './project-query';

const parse = (query = '') => parseListQuery(new URL(`http://localhost/?${query}`));

describe('parseListQuery: the filter', () => {
	it('shows open projects with no text by default', () => {
		expect(parse().filter).toEqual({ text: '', status: '' });
	});

	it('accepts one status, or all', () => {
		expect(parse('status=won').filter.status).toBe('won');
		expect(parse('status=all').filter.status).toBe('all');
	});

	it('falls back to the default for an unknown status', () => {
		expect(parse('status=bogus').filter.status).toBe('');
	});

	it('trims the text and keeps at most 100 characters', () => {
		expect(parse('q=%20%20acme%20%20').filter.text).toBe('acme');
		expect(parse(`q=${'x'.repeat(150)}`).filter.text).toHaveLength(100);
	});
});

describe('parseListQuery: the page', () => {
	it('is the first page by default', () => {
		expect(parse().page).toBe(1);
	});

	it('reads the page number', () => {
		expect(parse('page=3').page).toBe(3);
	});

	it('falls back to the first page for anything that is not a page number', () => {
		for (const bad of ['0', '-2', '1.5', 'abc', '', '99999999999999999999']) {
			expect(parse(`page=${bad}`).page).toBe(1);
		}
	});
});

describe('parseListQuery: the sort', () => {
	it('is the default order (newest first) when no sort is given', () => {
		expect(parse().sort).toBeNull();
	});

	it('sorts ascending unless it is asked to go descending', () => {
		expect(parse('sort=customer').sort).toEqual({ key: 'customer', dir: 'asc' });
		expect(parse('sort=status&dir=desc').sort).toEqual({ key: 'status', dir: 'desc' });
		expect(parse('sort=project&dir=sideways').sort).toEqual({ key: 'project', dir: 'asc' });
	});

	it('ignores an unknown column, whatever the direction is', () => {
		expect(parse('sort=bogus&dir=desc').sort).toBeNull();
	});

	it('always ends the order with the newest first, so ties are stable', () => {
		expect(parse().orderBy).toHaveLength(1);
		expect(parse('sort=customer').orderBy).toHaveLength(2);
	});
});
