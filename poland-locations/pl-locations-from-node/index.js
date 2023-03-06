// ** Mapping parsed from:
// - `cities.json` npm (npm-cities-parser.js) 
// - `https://simplemaps.com/data/pl-cities` (data/parsed-from-simplemaps.json)
// - `http://cybermoon.pl/wiedza/wspolrzedne/wspolrzedne_polskich_miejscowosci_a.html` (data/parsed-from-cybermoon-browser.json)


const fs = require('fs/promises');
const { Client } = require('pg');   

const _client = new Client({
    user: 'root',
    host: '127.0.0.1',
    database: 'PetForPet',
    password: 'root',
    port: 5432
  })

_client.connect();

main();

async function main() {
   try {
    const regionCitiesFromSimpleMaps = JSON.parse(await fs.readFile('data/parsed-from-simplemaps.json'));
    const rawCitiesFromPackage = JSON.parse(await fs.readFile('data/parsed-from-cities.json'));
    const rawCitiesFromCybermoon = JSON.parse(await fs.readFile('data/parsed-from-cybermoon-browser.json'));

    const parsedRegionsMap = parseRegions(regionCitiesFromSimpleMaps);
    const parsedCities = parseCities(regionCitiesFromSimpleMaps, rawCitiesFromPackage, rawCitiesFromCybermoon);

    console.log('regions: ' + parsedRegionsMap.size);
    console.log('cities: ' + parsedCities.length);

    let polandCountryId = await addCountry({
        name: {
            uk: "Польща",
            en: "Poland",
            ru: "Польша"
        }
    });

    console.log('added country ' + polandCountryId);

    const regionsNameToIdMap = new Map();

    for (let parsedRegion of parsedRegionsMap) {
        const regionName = parsedRegion[0];
        const region = parsedRegion[1];

        const regionId = await addRegion(region, polandCountryId);

        regionsNameToIdMap.set(regionName, regionId);
    }

    console.log('added regions');

    for (let parsedCity of parsedCities) {
        let regionId = null;
        if (parsedCity.region) {
            regionId = regionsNameToIdMap.get(parsedCity.region)
        }
        
        const city = {
            name:  {
                en: parsedCity.name,
                uk: parsedCity.name,
                ru: parsedCity.name,
            },
            population: parsedCity.population
        }

        await addCity(city, regionId, polandCountryId);
    }
    console.log('added cities');
   } finally {
    _client.end()
   }
}

async function addCountry(country) {
    const query = "INSERT INTO countries(title_ru, title_ua, title_en, created_date_time) VALUES($1, $2, $3, $4)  RETURNING *";
    const values = [country.name.ru, country.name.uk, country.name.en, getPostgresDateNow()];
  
    try {
      const res = await _client.query(query, values)
      return res.rows[0].id;
  
    } catch (err) {
      console.log(err.stack);
    }
}

async function addRegion(region, countryId) {
    const query = "INSERT INTO regions(country_id, title_ru, title_ua, title_en, created_date_time) VALUES($1, $2, $3, $4, $5)  RETURNING *";
    const values = [countryId, region.name.ru, region.name.uk, region.name.en, getPostgresDateNow()];
  
    try {
      const res = await _client.query(query, values);
      return res.rows[0].id;
    } catch (err) {
      console.log(err.stack);
    }
  }

async function addCity(city, regionId, countryId) {
    const query = "INSERT INTO cities(country_id, region_id, title_ru, title_ua, title_en, created_date_time, population) VALUES($1, $2, $3, $4, $5, $6, $7)  RETURNING *";

    let enCityName = city.name.en
        .replace("ą", "a")
        .replace("Ą", "A")
        .replace("ć", "c")
        .replace("Ć", "C")
        .replace("ę", "e")
        .replace("Ę", "E")
        .replace("ł", "l")
        .replace("Ł", "L")
        .replace("ń", "n")
        .replace("Ń", "N")
        .replace("ó", "o")
        .replace("Ó", "O")
        .replace("ś", "s")
        .replace("Ś", "S")
        .replace("ź", "z")
        .replace("Ź", "Z")
        .replace("ż", "z")
        .replace("Ż", "Z");
    
    const values = [countryId, regionId, city.name.ru, city.name.uk, enCityName, getPostgresDateNow(), city.population];
  
    try {
      const res = await _client.query(query, values)
      return res.rows[0].id;
    } catch (err) {
      console.log(err.stack);
    }
  }

function parseRegions(regionCities) {
    const regions = new Map();

    for (let city of regionCities) {
        regions.set(city.admin_name, {
            name: {
                uk: city.admin_name,
                en: city.admin_name,
                ru: city.admin_name,
            }
        });
    }

    return regions;
}

function parseCities(regionCitiesFromSimpleMaps, rawCitiesFromPackage, rawCitiesFromCybermoon) {
    const map = new Set();
    const cities = [];

    const cityToRegionsMap = parseAllRegions(rawCitiesFromCybermoon);

    // get all cities parsed with population (the most important onces)
    for (let regionCity of regionCitiesFromSimpleMaps) {
        const mapKey = `${regionCity.city} ${regionCity.admin_name}`;

        if (map.has(mapKey)) {
            console.log('error map has city already')
        }
        let parsedPopulation = 0;

        if (regionCity.population && regionCity.population !== "") {
            parsedPopulation = Number.parseInt(regionCity.population);
        }

        map.add(mapKey);

        cities.push({
            name: regionCity.city,
            region: regionCity.admin_name,
            population: parsedPopulation
        });
    }

    // parse 2-3k of Poland cities with getting region from 39k Poland locations parsed
    for (let city of rawCitiesFromPackage) {
        let regions = cityToRegionsMap.get(city.name);

        for (let region of regions) {
            const mapKey = `${city.name} ${region}`;

            if (map.has(mapKey)) {
                continue;
            }

            cities.push({
                name: city.name,
                region: region,
                population: 0
            });
        }
    }

    return cities;
}

function parseAllRegions(rawCitiesFromCybermoon) {
    // parse from 39k of Poland locations, just to get region name
    const cityToRegionsSet = new Set();
    const cityToRegionsMap = new Map();

    for (let rawCity of rawCitiesFromCybermoon) {
        const mapKey = `${rawCity.name} ${rawCity.region}`;

        if (cityToRegionsSet.has(mapKey)) {
            continue;
        }

        cityToRegionsSet.add(mapKey);

        if (!cityToRegionsMap.has(rawCity.name)) {
            cityToRegionsMap.set(rawCity.name, [])
        }

        cityToRegionsMap.get(rawCity.name).push(rawCity.region);
    }

    return cityToRegionsMap;
}


function getPostgresDateNow() {
    return new Date().toISOString().slice(0, 10);
}