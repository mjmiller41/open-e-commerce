
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

// Load environment variables from .env (Remote Config)
dotenv.config({ path: '.env' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration for REMOTE (Source)
const REMOTE_SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL; // Using VITE_ var as it usually points to prod in .env
const REMOTE_SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

// Configuration for LOCAL (Destination)
// Standard local Supabase ports and keys
const LOCAL_SUPABASE_URL = 'http://127.0.0.1:54321';
const LOCAL_SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // Needed for bypassing policies if needed, or use anon if public

if (!REMOTE_SUPABASE_URL || !REMOTE_SUPABASE_KEY) {
	console.error('Error: Remote Supabase credentials (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are missing from .env');
	process.exit(1);
}

// Check if we have local service key, if not warn but try with anon if bucket is public? 
// But usually for writes we want service key or authenticated user. 
// For local dev, we often have the service_role key in .env or we can just hardcode the known default one for local dev?
// NO, never hardcode. We assume the user has SUPABASE_SERVICE_ROLE_KEY in .env or we ask for it. 
// The push_storage.js used `env.SUPABASE_SERVICE_ROLE_KEY`.

if (!LOCAL_SUPABASE_SERVICE_KEY) {
	console.error('Error: SUPABASE_SERVICE_ROLE_KEY is required for writing to local storage.');
	process.exit(1);
}

const remoteClient = createClient(REMOTE_SUPABASE_URL, REMOTE_SUPABASE_KEY);
const localClient = createClient(LOCAL_SUPABASE_URL, LOCAL_SUPABASE_SERVICE_KEY);

const BUCKET_NAME = 'products';
const TEMP_DIR = path.resolve(__dirname, '../temp_images');

async function downloadFromRemote() {
	console.log(`Listing files in remote bucket: ${BUCKET_NAME}`);
	const { data: files, error } = await remoteClient.storage.from(BUCKET_NAME).list();

	if (error) {
		console.error('Error listing remote files:', error);
		return [];
	}

	if (!fs.existsSync(TEMP_DIR)) {
		fs.mkdirSync(TEMP_DIR);
	}

	console.log(`Found ${files.length} files. Downloading...`);
	const downloadedFiles = [];

	for (const file of files) {
		if (file.name === '.emptyFolderPlaceholder') continue;

		console.log(`Downloading ${file.name}...`);
		const { data, error: downloadError } = await remoteClient.storage.from(BUCKET_NAME).download(file.name);

		if (downloadError) {
			console.error(`Error downloading ${file.name}:`, downloadError);
			continue;
		}

		const buffer = Buffer.from(await data.arrayBuffer());
		const filePath = path.join(TEMP_DIR, file.name);
		fs.writeFileSync(filePath, buffer);
		downloadedFiles.push(file.name);
	}

	return downloadedFiles;
}

async function uploadToLocal(fileNames) {
	console.log(`Uploading ${fileNames.length} files to local bucket: ${BUCKET_NAME}`);

	// Ensure bucket exists locally
	const { data: buckets, error: listError } = await localClient.storage.listBuckets();

	if (listError) {
		console.error('Error listing local buckets:', listError);
	}

	const bucketExists = buckets ? buckets.find(b => b.name === BUCKET_NAME) : false;

	if (!bucketExists) {
		console.log(`Creating local bucket ${BUCKET_NAME}...`);
		const { error: createError } = await localClient.storage.createBucket(BUCKET_NAME, { public: true });
		if (createError) console.error('Failed to create bucket:', createError);
	}

	for (const fileName of fileNames) {
		const filePath = path.join(TEMP_DIR, fileName);
		const fileContent = fs.readFileSync(filePath);

		// Infer content type
		const ext = path.extname(fileName).toLowerCase();
		let contentType = 'application/octet-stream';
		if (ext === '.png') contentType = 'image/png';
		else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
		else if (ext === '.webp') contentType = 'image/webp';

		console.log(`Uploading ${fileName} to local...`);
		const { error } = await localClient.storage
			.from(BUCKET_NAME)
			.upload(fileName, fileContent, {
				contentType,
				upsert: true
			});

		if (error) {
			console.error(`Error uploading ${fileName}:`, error);
		}
	}
}

async function main() {
	try {
		const files = await downloadFromRemote();
		if (files.length > 0) {
			await uploadToLocal(files);
			console.log('Sync complete.');
		} else {
			console.log('No files to sync.');
		}
	} catch (e) {
		console.error('Sync failed:', e);
	} finally {
		// Cleanup temp dir
		if (fs.existsSync(TEMP_DIR)) {
			fs.rmSync(TEMP_DIR, { recursive: true, force: true });
		}
	}
}

main();
