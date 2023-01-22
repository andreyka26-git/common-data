const fsPromise = require('fs').promises;
const fs = require('fs');
const { Client } = require('pg');

const REGIONS_PARSED_FILE = 'regions-parsed.json';
const CITIES_PARSED_FILE = 'cities-parsed.json';

const pgClient = new Client({
    user: 'root',
    host: '127.0.0.1',
    database: 'PetForPet',
    password: 'root',
    port: 5432
});

main();

async function main() {
    const regionsJson = await fsPromise.readFile(REGIONS_PARSED_FILE);   
    const citiesJson = await fsPromise.readFile(CITIES_PARSED_FILE);

    const regions = JSON.parse(regionsJson);
    const cities = JSON.parse(citiesJson);

    try {
        pgClient.connect()

        await saveCountry(1, "Україна", "Украина", "Ukraine", "2022-05-14");

        for (let region of regions) {
            await  saveRegion(region.id, region.uaName, region.ruName, region.enName, 1, region.date);
        }

        for (let city of cities) {
            await saveCity(city.id, city.uaName, city.ruName, city.enName, city.population, city.regionId, 1, city.date);
        }

    } finally {
        pgClient.end();
    }
}

async function saveCountry(id, ua, ru, en, date) {
    const query = "INSERT INTO countries(id, title_ru, title_ua, title_en, created_date_time) VALUES($1, $2, $3, $4, $5)  RETURNING *";
    const values = [id, ru, ua, en, date];

    try {
        const res = await pgClient.query(query, values)
    } catch (err) {
        console.log(err);
    }
}

async function saveRegion(id, ua, ru, en, countryId, date) {
    const query = "INSERT INTO regions(id, title_ru, title_ua, title_en, country_id, created_date_time) VALUES($1, $2, $3, $4, $5, $6)  RETURNING *";
    const values = [id, ru, ua, en, countryId, date];

    try {
        const res = await pgClient.query(query, values)
    } catch (err) {
        console.log(err);
    }
}

async function saveCity(id, ua, ru, en, population, regionId, countryId, date) {
    const query = "INSERT INTO cities(id, title_ru, title_ua, title_en, population, region_id, country_id, created_date_time) VALUES($1, $2, $3, $4, $5, $6, $7, $8)  RETURNING *";
    const values = [id, ru, ua, en, population, regionId, countryId, date];

    try {
        const res = await pgClient.query(query, values)
    } catch (err) {
        console.log(err);
    }
}
