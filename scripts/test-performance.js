import fs from 'fs';
import puppeteer from 'puppeteer';
import lighthouse from 'lighthouse';
import { resolveConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { execSync, spawn } from 'child_process';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dynamic Base URL Resolution
const viteConfig = await resolveConfig({ mode: 'development' }, 'serve');
const PORT = viteConfig.server?.port || 5173;
const base = viteConfig.base || '/';
const removeTrailingSlash = (str) => str.endsWith('/') ? str.slice(0, -1) : str;
const BASE_URL = removeTrailingSlash(`http://localhost:${PORT}${base}`);

console.log(`Using Base URL: ${BASE_URL}`); // e.g. http://localhost:5173/open-e-commerce

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Ensure report directory exists
const REPORT_DIR = path.join(__dirname, '../performance-reports');
if (!fs.existsSync(REPORT_DIR)) {
	fs.mkdirSync(REPORT_DIR);
}

let previewProcess = null;

async function startPreviewServer() {
	console.log('Building project for production...');
	try {
		execSync('npm run build', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
	} catch (e) {
		console.error('Build failed. Aborting tests.');
		process.exit(1);
	}

	console.log(`Starting preview server on port ${PORT}...`);
	previewProcess = spawn('npx', ['vite', 'preview', '--port', String(PORT)], {
		cwd: path.join(__dirname, '..'),
		stdio: 'inherit',
		shell: true,
		detached: true // Allow killing process group
	});

	// Wait for server to be ready
	console.log('Waiting for server to be ready...');
	const maxRetries = 20;
	let retries = 0;
	while (retries < maxRetries) {
		try {
			// Ensure we check with a trailing slash if necessary for the directory index
			// But since BASE_URL is stripped of trailing slash, and the server might redirect /foo to /foo/,
			// we should check the root index explicitly or just allow redirects.
			const checkUrl = `${BASE_URL}/`;
			const response = await fetch(checkUrl);
			if (response.ok) {
				console.log('Server is ready!');
				return;
			}
		} catch (e) {
			// Ignore connection errors and retry
		}
		await new Promise(r => setTimeout(r, 1000));
		retries++;
		process.stdout.write('.');
	}
	console.error('\nServer failed to start in time.');
	if (previewProcess) {
		try {
			process.kill(-previewProcess.pid);
		} catch (e) { }
	}
	process.exit(1);
}

async function runLighthouse(url, opts, config = null) {
	console.log(`Running Lighthouse on ${url}...`);
	try {
		const runnerResult = await lighthouse(url, opts, config);
		const reportHtml = runnerResult.report;

		const urlObj = new URL(url);
		const urlPath = urlObj.pathname.replace(/\//g, '_') || '_home';
		const filename = `report${urlPath}_${Date.now()}.html`;
		const reportPath = path.join(REPORT_DIR, filename);
		fs.writeFileSync(reportPath, reportHtml);

		console.log(`Report saved to ${reportPath}`);

		// Copy to public for easy viewing if server is still running manually later
		const publicDir = path.join(__dirname, '../public');
		if (!fs.existsSync(publicDir)) {
			fs.mkdirSync(publicDir);
		}
		const publicReportPath = path.join(publicDir, 'report.html');
		fs.writeFileSync(publicReportPath, reportHtml);
		console.log(`Latest report also copied to ${publicReportPath}`);

		return runnerResult.lhr;
	} catch (e) {
		console.error(`Lighthouse failed for ${url}:`, e);
		throw e;
	}
}


function cleanupReports(keepCount = 5) {
	try {
		const files = fs.readdirSync(REPORT_DIR)
			.filter(f => f.endsWith('.html'))
			.map(f => ({
				name: f,
				time: fs.statSync(path.join(REPORT_DIR, f)).mtime.getTime()
			}))
			.sort((a, b) => b.time - a.time); // Newest first

		if (files.length > keepCount) {
			console.log(`Cleaning up old reports (keeping latest ${keepCount})...`);
			files.slice(keepCount).forEach(file => {
				const filePath = path.join(REPORT_DIR, file.name);
				fs.unlinkSync(filePath);
				console.log(`Deleted old report: ${file.name}`);
			});
		}
	} catch (e) {
		console.error('Error cleaning up reports:', e);
	}
}

async function runTests() {
	await startPreviewServer();

	console.log('Starting Performance Tests...');

	// 1. Test Public Page (ProductList)
	console.log('Launching Puppeteer for public test...');
	const browserPublic = await puppeteer.launch({
		headless: "new",
		args: [`--remote-debugging-port=9222`]
	});

	try {
		await new Promise(r => setTimeout(r, 1000));
		await runLighthouse(`${BASE_URL}/`, { logLevel: 'info', output: 'html', port: 9222 });
	} catch (e) {
		console.error('Error testing public page:', e);
	} finally {
		await browserPublic.close();
	}

	// 2. Test Authenticated Page (AdminProductDetail)
	console.log('Launching Puppeteer for authenticated test...');
	const browserAuth = await puppeteer.launch({
		headless: "new",
		args: [`--remote-debugging-port=9222`]
	});

	const page = await browserAuth.newPage();

	try {
		console.log('Navigating to login...');
		await page.goto(`${BASE_URL}/login`);

		console.log('Entering credentials...');
		await page.waitForSelector('input[name="email"]');
		await page.type('input[name="email"]', ADMIN_EMAIL);
		await page.type('input[name="password"]', ADMIN_PASSWORD);

		await page.click('button[type="submit"]');

		try {
			await page.waitForFunction(
				(loginUrl) => window.location.href !== loginUrl || document.querySelector('.text-destructive'),
				{ timeout: 10000 },
				page.url()
			);
		} catch (e) {
			console.error('Timeout waiting for login response. Checking for errors...');
		}

		if (page.url().includes('/login')) {
			console.error('Still on login page after submit.');
			const errorMsg = await page.evaluate(() => document.querySelector('.text-destructive')?.textContent);
			if (errorMsg) {
				console.error('Login Error displayed:', errorMsg);
			} else {
				console.error('No error message found. Taking screenshot of failed login state...');
				await page.screenshot({ path: path.join(REPORT_DIR, 'error_login_failed.png') });
			}
			throw new Error('Login failed');
		}

		console.log(`Logged in successfully. Redirected to: ${page.url()}`);
		const targetUrl = `${BASE_URL}/admin/product/1`;

		const authOptions = {
			logLevel: 'info',
			output: 'html',
			port: 9222,
			disableStorageReset: true
		};

		await runLighthouse(targetUrl, authOptions);

	} catch (e) {
		console.error('Error testing authenticated page:', e);
	} finally {
		await browserAuth.close();
	}

	cleanupReports(); // Cleanup old reports
	console.log('Tests finished. Reports are in /performance-reports');

	if (previewProcess) {
		console.log('Stopping preview server...');
		try {
			process.kill(-previewProcess.pid); // Kill process group
		} catch (e) {
			// ignore
		}
		try {
			previewProcess.kill();
		} catch (e) {
			// ignore
		}
	}
	process.exit(0);
}

runTests();
