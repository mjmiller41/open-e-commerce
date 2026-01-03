
import fs from 'fs';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPORT_DIR = path.join(__dirname, '../performance-reports');

// Find latest non-admin report
let reportPath;
try {
	if (!fs.existsSync(REPORT_DIR)) {
		console.error(`Report directory not found: ${REPORT_DIR}`);
		process.exit(1);
	}

	const files = fs.readdirSync(REPORT_DIR)
		.filter(f => f.endsWith('.html') && !f.includes('admin'))
		.map(f => ({
			name: f,
			time: fs.statSync(path.join(REPORT_DIR, f)).mtime.getTime()
		}))
		.sort((a, b) => b.time - a.time);

	if (files.length === 0) {
		console.error('No non-admin performance reports found.');
		process.exit(1);
	}

	reportPath = path.join(REPORT_DIR, files[0].name);
	console.log(`Analyzing report: ${reportPath}`);

} catch (e) {
	console.error('Error finding report:', e);
	process.exit(1);
}

const content = fs.readFileSync(reportPath, 'utf8');

const prefix = 'window.__LIGHTHOUSE_JSON__ = ';
const startIndex = content.indexOf(prefix);
if (startIndex === -1) {
	console.error('Could not find Lighthouse JSON in report');
	process.exit(1);
}

const jsonStart = startIndex + prefix.length;
const scriptEndIndex = content.indexOf('</script>', jsonStart);
let jsonString = content.substring(jsonStart, scriptEndIndex).trim();
if (jsonString.endsWith(';')) {
	jsonString = jsonString.slice(0, -1);
}

try {
	const report = JSON.parse(jsonString);
	const audits = report.audits;
	const failedAudits = [];

	for (const [id, audit] of Object.entries(audits)) {
		if (audit.score !== null && audit.score < 0.9) {
			failedAudits.push({
				id,
				title: audit.title,
				score: audit.score,
				displayValue: audit.displayValue
			});
		}
	}

	console.log(JSON.stringify(failedAudits, null, 2));
} catch (e) {
	console.error('Failed to parse JSON:', e);
}
