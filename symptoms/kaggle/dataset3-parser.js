const fs = require('fs').promises;
const { promisify } = require('util');
const writeFileAsync = promisify(fs.writeFile);

const inputFile = 'dataset3/dataset3.csv';

main();

async function main() {
    try {
        //await parseSymptomsToDiseases();
        //await parseUniqueSymptoms();
        await parseUniqueSymptomsMetadata();
    } catch (error) {
        console.error('Error:', error);
    }
}

async function parseSymptomsToDiseases() {
    const outputFile = 'dataset3/symptoms-to-diseases.json';
    const diseaseAndSymptoms = await getDiseaseAndSymptoms(inputFile);

    await writeFileAsync(outputFile, JSON.stringify(diseaseAndSymptoms, null, 2));
}

async function parseUniqueSymptoms() {
    const outputFile = 'dataset3/unique-symptoms.json';
    const diseaseAndSymptoms = await getDiseaseAndSymptoms(inputFile);

    const allSymptoms = diseaseAndSymptoms.flatMap(ds => ds.symptoms);
    const uniqueSymptoms = [...new Set(allSymptoms)].map(s => s);

    await writeFileAsync(outputFile, JSON.stringify(uniqueSymptoms, null, 2));
}

async function parseUniqueSymptomsMetadata() {
    const outputFile = 'dataset3/unique-symptoms-metadata.json';

    const diseasesAndSymptoms = await getDiseaseAndSymptoms(inputFile);
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

async function getDiseaseAndSymptoms(inputFile) {
    const symptoms = [];

    const fileContent = await fs.readFile(inputFile, 'utf8');
    const rows = fileContent.split('\n');

    let isFirstRow = true;
    let symptomsMap = [];

    for (const row of rows) {
        const values = row.split(',');

        if (isFirstRow) {
            isFirstRow = false;
            symptomsMap = values.slice(1);
            continue;
        }

        const disease = values[0].trim().toLowerCase();
        const symptomsArr = values.slice(1);

        const resultingSymptoms = [];

        for (let i = 0; i < symptomsArr.length; i++) {
            if (symptomsArr[i] === '1') {
                resultingSymptoms.push(symptomsMap[i].trim().toLowerCase());
            }
        }

        symptoms.push({ disease, symptoms: resultingSymptoms });
    }

    return symptoms;
}

