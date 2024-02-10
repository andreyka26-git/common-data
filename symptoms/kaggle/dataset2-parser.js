const fs = require('fs');
const csv = require('csv-parser');
const { promisify } = require('util');
const writeFileAsync = promisify(fs.writeFile);

const inputFile = 'dataset2/dataset2.csv';

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
    const outputFile = 'dataset2/symptoms-to-diseases.json';
    const diseaseAndSymptoms = await getDiseaseAndSymptoms(inputFile);

    await writeFileAsync(outputFile, JSON.stringify(diseaseAndSymptoms, null, 2));
}

async function parseUniqueSymptoms() {
    const outputFile = 'dataset2/unique-symptoms.json';
    const diseaseAndSymptoms = await getDiseaseAndSymptoms(inputFile);

    const uniqueSymptoms = Array.from(new Set(diseaseAndSymptoms.flatMap(ds => ds.symptoms)));
    await writeFileAsync(outputFile, JSON.stringify(uniqueSymptoms, null, 2));
}

async function parseUniqueSymptomsMetadata() {
    const outputFile = 'dataset2/unique-symptoms-metadata.json';

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
    return new Promise((resolve, reject) => {
        const symptoms = [];

        const stream = fs.createReadStream(inputFile, { encoding: 'utf16le' })
            .pipe(csv())
            .on('data', (row) => {
                const values = Object.values(row);

                const symptomsColumn = values[2];
                const disease = values[1].trim().toLowerCase();

                const symptomsSubstring = symptomsColumn.substring(symptomsColumn.indexOf('['), symptomsColumn.indexOf(']') + 1);
                const symptomObj = JSON.parse(symptomsSubstring);
                
                let symptomArr = [];
                
                for (let i = 0; i < symptomObj.length; i++) {
                    if (i % 2 === 0) {
                        symptomArr.push(symptomObj[i].symptoms.trim().toLowerCase());
                    }
                }
                
                symptoms.push({ disease, symptoms: symptomArr });
            })
            .on('end', () => {
                resolve(symptoms);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
}

