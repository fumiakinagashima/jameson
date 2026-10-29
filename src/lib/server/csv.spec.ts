import { describe, expect, it } from 'vitest';
import { cell, toCsv } from './csv';

describe('cell', () => {
	it('leaves plain text alone', () => {
		expect(cell('Acme Inc.')).toBe('Acme Inc.');
		expect(cell('')).toBe('');
	});

	it('quotes a value with a comma, a quote or a line break', () => {
		expect(cell('a,b')).toBe('"a,b"');
		expect(cell('say "hi"')).toBe('"say ""hi"""');
		expect(cell('line1\nline2')).toBe('"line1\nline2"');
		expect(cell('line1\r\nline2')).toBe('"line1\r\nline2"');
	});

	it('keeps non-ASCII text as it is', () => {
		expect(cell('é日本語')).toBe('é日本語');
	});

	it('prefixes a quote when a spreadsheet would run the text as a formula', () => {
		expect(cell('=HYPERLINK("http://x")')).toBe(`"'=HYPERLINK(""http://x"")"`);
		expect(cell('+1 555 0100')).toBe(`'+1 555 0100`);
		expect(cell('-5')).toBe(`'-5`);
		expect(cell('@x')).toBe(`'@x`);
		expect(cell('\tx')).toBe(`'\tx`);
	});

	it('does not touch a sign in the middle of the text', () => {
		expect(cell('a=b')).toBe('a=b');
		expect(cell('1+1')).toBe('1+1');
	});
});

describe('toCsv', () => {
	it('starts with a BOM and ends every line, the last one too, with CRLF', () => {
		const csv = toCsv(['A', 'B'], [['1', '2'], ['3', '4']]);
		expect(csv).toBe('\uFEFFA,B\r\n1,2\r\n3,4\r\n');
	});

	it('is just the header when there are no rows', () => {
		expect(toCsv(['A', 'B'], [])).toBe('\uFEFFA,B\r\n');
	});
});
