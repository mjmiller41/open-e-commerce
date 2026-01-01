import fs from 'fs';
import { execSync } from 'child_process';
import ghpages from 'gh-pages';

const envLocal = '.env.local';
const envBackup = '.env.local.bak';

let renamed = false;

try {
	// 1. Rename .env.local to hide it from Vite build
	if (fs.existsSync(envLocal)) {
		console.log(`Moving ${envLocal} to ${envBackup} to ensure production build...`);
		fs.renameSync(envLocal, envBackup);
		renamed = true;
	}

	// 2. Run Build
	console.log('Running build...');
	execSync('npm run build', { stdio: 'inherit' });

	// 3. Deploy
	console.log('Deploying to gh-pages...');
	await new Promise((resolve, reject) => {
		ghpages.publish('dist', (err) => {
			if (err) reject(err);
			else resolve();
		});
	});
	console.log('Deployment complete!');

} catch (error) {
	console.error('Deployment failed:', error);
	process.exit(1);
} finally {
	// 4. Restore .env.local
	if (renamed) {
		if (fs.existsSync(envBackup)) {
			console.log(`Restoring ${envLocal}...`);
			fs.renameSync(envBackup, envLocal);
		}
	}
}
