// Spreadsheets run a cell that starts with one of these as a formula. Prefixing a quote
// keeps typed text from being executed when the file is opened.
const FORMULA = /^[=+\-@\t\r]/;

// One cell made from text a person typed.
export const cell = (value: string) => {
	const safe = FORMULA.test(value) ? `'${value}` : value;
	return /[",\r\n]/.test(safe) ? `"${safe.replaceAll('"', '""')}"` : safe;
};

// The whole file from a header and rows of finished cells. The BOM makes Excel read the
// file as UTF-8.
export const toCsv = (header: string[], rows: string[][]) =>
	'\uFEFF' + [header, ...rows].map((row) => row.join(',')).join('\r\n') + '\r\n';
