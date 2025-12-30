const fs = require('fs');
const path = require('path');

const oedPath = path.join(__dirname, '../src/assets/oed_abbreviations.json');
const oedAbbreviations = JSON.parse(fs.readFileSync(oedPath, 'utf8'));

function getAbbreviation(word) {
	if (!word) return '';
	const cleanWord = word.trim().toLowerCase();

	if (oedAbbreviations[cleanWord]) {
		return oedAbbreviations[cleanWord].replace(/\./g, '').toUpperCase();
	}

	// Consonant Skeleton Fallback
	const alphanumeric = cleanWord.replace(/[^a-z0-9]/g, '');
	const firstChar = alphanumeric[0].toUpperCase();
	const rest = alphanumeric.slice(1).toUpperCase();
	const consonants = rest.replace(/[AEIOU]/g, '');

	// Deduplicate adjacent consonants
	let uniqueConsonants = '';
	for (let i = 0; i < consonants.length; i++) {
		if (i === 0 || consonants[i] !== consonants[i - 1]) {
			uniqueConsonants += consonants[i];
		}
	}

	return (firstChar + uniqueConsonants).substring(0, 3);
}

function generateSKU(category, brand, name, variant) {
	const categorySegments = (category || '').split('>').map(s => s.trim());
	const leafCategory = categorySegments.length > 0 ? categorySegments[categorySegments.length - 1] : '';
	const catWord = leafCategory.split(' ')[0] || '';
	const catPart = getAbbreviation(catWord);

	const brandPart = getAbbreviation(brand || '');

	const modelWord = (name || '').split(' ')[0] || '';
	const modelPart = getAbbreviation(modelWord);

	const variantPart = variant ? getAbbreviation(variant) : '';

	const parts = [catPart, brandPart, modelPart];
	if (variantPart) {
		parts.push(variantPart);
	}

	return parts.filter(p => p.length > 0).join('-');
}

// Test Cases
const tests = [
	{ cat: 'Electronics', brand: 'Sony', name: 'WH-1000XM4', var: 'Black', expected: 'ELEC-SNY-WH1-BLK' },
	{ cat: 'Office Supplies', brand: 'Staples', name: 'Paper', var: '', expected: 'OFC-STP-PPR' },
	{ cat: 'Hardware', brand: 'Acme', name: 'Hammer', var: 'Heavy', expected: 'HDWR-ACM-HMR-HVY' },
	{ cat: 'Books > Fiction', brand: 'Penguin', name: '1984', var: 'Hardcover', expected: 'FCT-PNG-198-HRD' },
	{ cat: 'University', brand: 'Oxford', name: 'Dictionary', var: 'Volume 1', expected: 'UNIV-OXF-DICT-VLM' },
	{ cat: 'Electronics', brand: 'Bose', name: 'Headphones', var: 'Black', expected: 'ELEC-BS-HDPH-BLK' }
];

console.log('Running SKU Generation Tests...\n');

tests.forEach(test => {
	const result = generateSKU(test.cat, test.brand, test.name, test.var);
	console.log(`Input: ${JSON.stringify(test)}`);
	console.log(`Generated: ${result}`);
	console.log('---');
});
