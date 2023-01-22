const axios = require('axios');
const { parse } = require('node-html-parser');
const fs = require('fs').promises;
const translate = require('@vitalets/google-translate-api');

const URL = "https://uk.wikipedia.org/wiki/%D0%9C%D1%96%D1%81%D1%82%D0%B0_%D0%A3%D0%BA%D1%80%D0%B0%D1%97%D0%BD%D0%B8_(%D0%B7%D0%B0_%D0%BD%D0%B0%D1%81%D0%B5%D0%BB%D0%B5%D0%BD%D0%BD%D1%8F%D0%BC)"

const REGIONS_PARSED_FILE = 'regions-parsed.txt';
const CITIES_PARSED_FILE = 'cities-parsed.txt';

const ROWS_SELECTOR = '.wikitable.sortable.mw-datatable tr';

const EN_LANG = 'en';
const RU_LANG = 'ru';

const exeptionRegions = new Map();
exeptionRegions.set("Київ", "Київська область");

main();

async function main() {
  if (await exists(REGIONS_PARSED_FILE) || await exists(CITIES_PARSED_FILE)) {
    console.log('already parsed');
    return;
  }

  const response = await axios.get(URL);

  const root = parse(response.data);
  const rows = root.querySelectorAll(ROWS_SELECTOR);

  rows.shift()
  rows.shift();

  let regionsCounter = 1;
  const regionsMap = new Map();

  let citiesCounter = 1;

  const dbRegions = [];
  const dbCities = [];

  for (let row of rows) {
    try {
      let region = row.querySelectorAll('td')[2].querySelector('span').innerText;

      region = formatName(region);

      if (!regionsMap.has(region)) {
        regionsMap.set(region, regionsCounter);
        regionsCounter++;   
      }
    }
    catch {
    }
  }

  for (let entry of regionsMap) {
    if (exeptionRegions.has(entry[0]))
      continue;

    const regionRuName = await translate(entry[0], { to: RU_LANG });
    const regionEnName = await translate(entry[0], { to: EN_LANG });

    dbRegions.push({id: entry[1], uaName: entry[0], ruName: regionRuName.text, enName: regionEnName.text, date: getDateNow()})
  }

  console.log('regions finished');

  for (let row of rows) {
    try {
      let city = row.querySelectorAll('td')[1].innerText;

      let region = row.querySelectorAll('td')[2].querySelector('span').innerText;
      region = formatName(region);

      const population = row.querySelectorAll('td')[5].innerText;

      city = formatName(city);

      const cityRuName = await translate(city, { to: RU_LANG });
      const cityEnName = await translate(city, { to: EN_LANG });
      dbCities.push({id: citiesCounter, uaName: city, ruName: cityRuName.text, enName: cityEnName.text, regionId: getRegionId(regionsMap, region), population: formatPopulation(population), date: getDateNow()})

      citiesCounter++;
      console.log(`city ${city} processed`)
    } catch (e){
      console.log('error' + e)
    }
  }

  await fs.writeFile(REGIONS_PARSED_FILE, JSON.stringify(dbRegions));
  await fs.writeFile(CITIES_PARSED_FILE, JSON.stringify(dbCities));
}

function formatName(name) {
  name = name.replace(/\&\#91\;/g, "");
  name = name.replace(/3\&\#93\;/g, "");
  name = name.replace(/\&\#91\;/g, "");
  name = name.replace(/4\&\#93\;/g, "");
  return name;
}

function formatPopulation(population) {
  population = population.replace(/\&nbsp\;/g, "");
  population = population.replace(/\&\#160\;/g, "");
  population = population.replace(/ /g, "");
  return Number.parseInt(population);
}

function getRegionId(regionMap, regionName) {
  if (exeptionRegions.has(regionName))
    regionName = exeptionRegions.get(regionName);

  return regionMap.get(regionName);
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch (err) {
    return false;
  }
}

function getDateNow() {
  return new Date().toISOString().slice(0, 10);
}