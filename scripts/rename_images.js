import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IMAGES_DIR = path.resolve(__dirname, '../public/images/products');

async function renameImages() {
	if (!fs.existsSync(IMAGES_DIR)) {
		console.error(`Directory not found: ${IMAGES_DIR}`);
		process.exit(1);
	}

	const files = fs.readdirSync(IMAGES_DIR);
	const renames = [];

	// 1. Group files by Product ID to determine sequence number
	// Pattern: [imageName]-[productId].[ext]
	// We look for the last hyphen to separate Name and ID.
	// Actually, some names might have hyphens. The ID is likely the number at the end.
	const productKeyMap = new Map(); // productId -> Array of { original, name, id, ext }

	for (const file of files) {
		if (file.startsWith('.')) continue; // Skip .DS_Store etc

		const ext = path.extname(file);
		const basename = path.basename(file, ext); // e.g. "acrylic-paint-set-39"

		// Find the last hyphen which should separate the name and the numeric ID
		const lastHyphenIndex = basename.lastIndexOf('-');
		if (lastHyphenIndex === -1) {
			console.warn(`Skipping file matching pattern: ${file}`);
			continue;
		}

		const namePart = basename.substring(0, lastHyphenIndex);
		const idPart = basename.substring(lastHyphenIndex + 1);

		if (!/^\d+$/.test(idPart)) {
			// If the part after the last hyphen is not a number, maybe it's not the ID?
			// The prompt says "existing file names already have the file name and product number"
			// We'll assume strict format for now and warn if not matching.
			console.warn(`Skipping file with non-numeric ID part: ${file} (found id: ${idPart})`);
			continue;
		}

		if (!productKeyMap.has(idPart)) {
			productKeyMap.set(idPart, []);
		}
		productKeyMap.get(idPart).push({
			original: file,
			name: namePart,
			id: idPart,
			ext: ext
		});
	}

	// 2. Determine new names
	for (const [id, items] of productKeyMap) {
		// Sort items if needed to ensure deterministic ordering? 
		// The prompt just says "indexed by the number of images". 
		// If we have multiple, their order in the directory listing is arbitrary.
		// Let's sort alpha by name just to be stable.
		items.sort((a, b) => a.original.localeCompare(b.original));

		items.forEach((item, index) => {
			const seqNo = index + 1;
			const newName = `${item.name}-${item.id}-${seqNo}${item.ext}`;

			renames.push({
				oldPath: path.join(IMAGES_DIR, item.original),
				newPath: path.join(IMAGES_DIR, newName),
				description: `${item.original} -> ${newName}`
			});
		});
	}

	console.log(`Found ${renames.length} files to rename.`);

	// 3. Perform renames
	for (const rename of renames) {
		// Check for collision
		if (fs.existsSync(rename.newPath) && rename.newPath !== rename.oldPath) {
			// If the target exists and it's not the same file (case insensitivity?)
			// We should probably be careful.
			console.warn(`Target exists, skipping: ${rename.description}`);
			continue;
		}

		try {
			fs.renameSync(rename.oldPath, rename.newPath);
			console.log(`Renamed: ${rename.description}`);
		} catch (err) {
			console.error(`Error renaming ${rename.description}:`, err);
		}
	}
}

renameImages();
