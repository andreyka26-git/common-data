const fs = require('fs');
const cheerio = require('cheerio');

main();
//process();

async function process() {
    const data = JSON.parse(await readFileAsync('scrappedWiki.json'));
    let content = data[0].content;

    content = htmlToText(content);

    let lastReferencesIndex = content.lastIndexOf('References');

    // Remove all text after the last occurrence of "References"
    if (lastReferencesIndex !== -1) {
        content = content.substring(0, lastReferencesIndex);
    }
}

async function main() {
    const data = await readFileAsync('wiki-symptoms.json');
    const entries = JSON.parse(data);

    for (let entry of entries) {
        try {
            if (entry.content) {
                continue;
            }

            const tokens = entry.href.split("/"); // Split the URL by forward slash
            const title = tokens[tokens.length - 1];

            let url = `https://en.wikipedia.org/w/api.php?action=parse&formatversion=2&format=json&page=${encodeURIComponent(title)}`;
            const json = await getWikiPage(url);

            const wikiContent = json.parse.text;
            entry.content = wikiContent;

            await delay(100);
            console.log(`${url} processed`);
        }
        catch (e) {
            console.error(e);
        }
    }
    console.log('done');

    await writeFileAsync("scrappedWiki.json", JSON.stringify(entries));
}

async function getWikiPage(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();

        return data;
    } catch (error) {
        console.error(error);
    }
}

async function readFileAsync(filename) {
    return new Promise((resolve, reject) => {
        fs.readFile(filename, 'utf8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

async function writeFileAsync(filename, data) {
    return new Promise((resolve, reject) => {
        fs.writeFile(filename, data, 'utf8', (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function htmlToText(html) {
    const $ = cheerio.load(html);
    return $('body').text();
}