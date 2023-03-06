// ** Parsing using https://www.npmjs.com/package/cities.json

const fs = require('fs');
const cities = require('cities.json');

const mapped = cities.filter(c => c.country === 'PL');
fs.writeFileSync('data/parsed-from-cities.json', JSON.stringify(mapped));