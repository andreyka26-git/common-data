const fsPromise = require('fs').promises;
const fs = require('fs');
const readline = require('readline');
const { Client } = require('pg');
const { v4 } = require('uuid');

const CATS_MIGRATION_FOLDER = 'cats_migrator';
const DOGS_MIGRATION_FOLDER = 'dogs_migrator';
const PARROT_MIGRATION_FOLDER = 'parrots_migrator';
const PHOTOS_FOLDER = 'photos';
const PARSED_FILE = 'parsed.txt';

const CAT_SPECIES_ID = '7cb3bd47-6040-44dc-b4ba-0797eab60432';
const DOG_SPECIES_ID = '4c964868-bfa7-4be0-bfd7-a7c90615e306';
const PARROT_SPECIES_ID = 'fcfabadb-c8e7-41f6-870c-a64caef06ba5';

main();

async function main() {
    //await migrate(CATS_MIGRATION_FOLDER, CAT_SPECIES_ID);
    //await migrate(DOGS_MIGRATION_FOLDER, DOG_SPECIES_ID);
    console.log('started');
    await migrate(PARROT_MIGRATION_FOLDER, PARROT_SPECIES_ID);
    console.log('finished');
}

async function migrate(migrationFolder, speciesId) {
    const parsedFilePath = `${migrationFolder}/${PARSED_FILE}`;
    const fileStream = fs.createReadStream(parsedFilePath);
    const pgClient = new Client({
        user: 'root',
        host: '127.0.0.1',
        database: 'PetForPet',
        password: 'root',
        port: 5432
    });

    try {
        pgClient.connect()

        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        for await (const line of rl) {
            const tokens = line.split(',');

            const ua = tokens[0];
            const ru = tokens[1];
            const en = tokens[2];

            const photoPath = `${migrationFolder}/${PHOTOS_FOLDER}/${ua}.jpg`

            let imageInBase64 = '';

            if (await exists(photoPath)) {
                imageInBase64 = await getFileBase64(photoPath);
            }

            await saveBreed(ua, ru, en, speciesId, imageInBase64, pgClient);
        }
    } finally {
        fileStream.destroy();
        pgClient.end();
    }
}

async function saveBreed(ua, ru, en, speciesId, image, pgClient) {
    const guid = v4();
    const query = "INSERT INTO breeds(id, title_ru, title_ua, title_en, photo_in_base64, species_id, created_date_time) VALUES($1, $2, $3, $4, $5, $6, $7)  RETURNING *";
    const values = [guid, ru, ua, en, image, speciesId, getPostgresDateNow()];

    try {
        const res = await pgClient.query(query, values)
    } catch (err) {
        console.log(err);
    }
}

async function getFileBase64(filePath) {
    const bytes = await fsPromise.readFile(filePath, { encoding: 'base64' });
    const base64 = `data:image/jpg;base64, ${bytes}`;
    return base64;
}

async function exists(filePath) {
    try {
        await fsPromise.access(filePath);
        return true;
    } catch (err) {
        return false;
    }
}

function getPostgresDateNow() {
    return new Date().toISOString().slice(0, 10);
}