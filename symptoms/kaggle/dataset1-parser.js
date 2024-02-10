const fs = require('fs');
const csv = require('csv-parser');
const { promisify } = require('util');

const writeFileAsync = promisify(fs.writeFile);

const inputFile = 'dataset1/dataset1.csv';

main();

async function main() {
    try {
        await parseSymptomsToDiseases();
        await parseUniqueSymptoms();
        await parseUniqueSymptomsMetadata();
    } catch (error) {
        console.error('Error:', error);
    }
}

async function parseSymptomsToDiseases() {
    const outputFile = 'dataset1/symptoms-to-diseases.json';

    const diseasesAndSymptoms = await extractDiseasesAndSymptoms(inputFile);
    await writeFileAsync(outputFile, JSON.stringify(diseasesAndSymptoms, null, 2));
}

async function parseUniqueSymptoms() {
    const outputFile = 'dataset1/unique-symptoms.json';

    const diseasesAndSymptoms = await extractDiseasesAndSymptoms(inputFile);
    const uniqueSymptoms = Array.from(new Set(diseasesAndSymptoms.flatMap(ds => ds.symptoms)));

    await writeFileAsync(outputFile, JSON.stringify(uniqueSymptoms, null, 2));
}

async function parseUniqueSymptomsMetadata() {
    const outputFile = 'dataset1/unique-symptoms-metadata.json';

    const diseasesAndSymptoms = await extractDiseasesAndSymptoms(inputFile);
    const uniqueSymptoms = new Map()

    for (let entry of diseasesAndSymptoms) {
        for (let symptom of entry.symptoms) {
            if (!uniqueSymptoms.has(symptom)) {
                uniqueSymptoms.set(symptom, 0);
            }

            uniqueSymptoms.set(symptom, uniqueSymptoms.get(symptom) + 1)
        }
    }

    const sortedSymptoms = Array.from(uniqueSymptoms.entries()).sort((a, b) => b[1] - a[1]);
    const uniqueSymptomsObject = Object.fromEntries(sortedSymptoms);

    await writeFileAsync(outputFile, JSON.stringify(uniqueSymptomsObject, null, 2));
}

async function extractDiseasesAndSymptoms(inputFile) {
    const stream = fs.createReadStream(inputFile).pipe(csv());
    const diseasesAndSymptoms = [];

    for await (const row of stream) {
        const values = Object.values(row);

        const disease = values[0].trim().toLowerCase();
        const symptoms = values.slice(1).map(s => s.trim().toLowerCase()).filter(s => s !== '').map(s => s.split('_').join(' ').replace('  ', ' '));

        diseasesAndSymptoms.push({ disease, symptoms });
    }

    return diseasesAndSymptoms;
}