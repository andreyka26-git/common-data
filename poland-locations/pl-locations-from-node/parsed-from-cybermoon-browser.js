// ** Parsed from http://cybermoon.pl/wiedza/wspolrzedne/wspolrzedne_polskich_miejscowosci_a.html
//      let a = document.querySelectorAll('table')[3].querySelectorAll('tr');
//      a.forEach(c => {
//          console.log(c.querySelectorAll('td')[0].innerText + ' ' + c.querySelectorAll('td')[1].innerText);
//      });
//      regex replace in file (.*)VM.*   -> ''

const fs = require('fs');
const readline = require('readline');

async function processLineByLine() {
  const fileStream = fs.createReadStream('data/parsed-from-cybermoon-browser.txt');

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const citiesSet = new Set();
  const cities = [];

  for await (const line of rl) {
    const splitArr = line.split(' ');
    const region = splitArr[splitArr.length - 1].trim();
    splitArr.pop();

    const cityName = splitArr.join(' ').trim();

    const keyString = `${cityName} ${region}`;
    if (citiesSet.has(keyString)) {
        continue;
    }

    citiesSet.add(keyString);

    cities.push({
        name: cityName,
        region: region
    });
  }

  fs.writeFileSync('data/parsed-from-cybermoon-browser.json', JSON.stringify(cities));
}

processLineByLine();