
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple .env parser to avoid dependencies
function loadEnv() {
	const envPath = path.resolve(__dirname, '../.env');
	if (!fs.existsSync(envPath)) {
		console.warn('.env file not found at', envPath);
		return {};
	}

	const content = fs.readFileSync(envPath, 'utf-8');
	const env = {};

	content.split('\n').forEach(line => {
		const trimmed = line.trim();
		if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
			const parts = trimmed.split('=');
			const key = parts[0].trim();
			// user might have values with =, so join the rest
			let value = parts.slice(1).join('=').trim();

			// Remove quotes if present
			if ((value.startsWith('"') && value.endsWith('"')) ||
				(value.startsWith("'") && value.endsWith("'"))) {
				value = value.slice(1, -1);
			}

			env[key] = value;
		}
	});

	return env;
}

const env = loadEnv();
const supabaseUrl = env.SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
	console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
	console.error('Please ensure they are set in your .env file or environment variables.');
	process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const BUCKET_NAME = 'products';
const LOCAL_DIR = path.resolve(__dirname, '../public/images/products');

async function uploadFile(filePath) {
	const fileName = path.basename(filePath);
	const fileContent = fs.readFileSync(filePath);

	// Simple mime type inference based on extension
	const ext = path.extname(fileName).toLowerCase();
	let contentType = 'application/octet-stream';
	if (ext === '.png') contentType = 'image/png';
	else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
	else if (ext === '.svg') contentType = 'image/svg+xml';
	else if (ext === '.gif') contentType = 'image/gif';
	else if (ext === '.webp') contentType = 'image/webp';

	console.log(`Uploading ${fileName}...`);

	const { data, error } = await supabase
		.storage
		.from(BUCKET_NAME)
		.upload(fileName, fileContent, {
			contentType,
			upsert: true
		});

	if (error) {
		console.error(`Failed to upload ${fileName}:`, error.message);
	} else {
		console.log(`Successfully uploaded ${fileName}`);
	}
}

async function main() {
	console.log(`Starting upload to bucket: ${BUCKET_NAME}`);
	console.log(`Reading from: ${LOCAL_DIR}`);

	if (!fs.existsSync(LOCAL_DIR)) {
		console.error(`Directory not found: ${LOCAL_DIR}`);
		process.exit(1);
	}

	try {
		// Check if bucket exists, if not construct it? 
		// Actually the client doesn't support creating buckets easily without admin api, 
		// but we are using service role so we can.
		// However, migration should have handled it. We will just try to list or get bucket.
		const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();

		if (bucketError) {
			console.error('Error listing buckets:', bucketError.message);
			// proceed anyway, maybe it works
		} else {
			const bucketExists = buckets.find(b => b.name === BUCKET_NAME);
			if (!bucketExists) {
				console.log(`Bucket '${BUCKET_NAME}' does not exist. Attempting to create...`);
				const { data, error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
					public: true
				});
				if (createError) {
					console.error('Failed to create bucket:', createError.message);
					process.exit(1);
				}
				console.log('Bucket created.');
			} else {
				console.log(`Bucket '${BUCKET_NAME}' exists.`);
			}
		}

		const files = fs.readdirSync(LOCAL_DIR);

		for (const file of files) {
			if (file === '.DS_Store') continue; // skip system files
			const fullPath = path.join(LOCAL_DIR, file);
			if (fs.statSync(fullPath).isFile()) {
				await uploadFile(fullPath);
			}
		}

		console.log('All uploads finished.');

	} catch (err) {
		console.error('Unexpected error:', err);
		process.exit(1);
	}
}

main();
