const axios = require('axios');
const { parse } = require('node-html-parser');
const fs = require('fs').promises;
const translate = require('@vitalets/google-translate-api');

const CAT_URL = 'https://uk.m.wikipedia.org/wiki/%D0%A1%D0%BF%D0%B8%D1%81%D0%BE%D0%BA_%D0%BA%D0%BE%D1%82%D1%8F%D1%87%D0%B8%D1%85_%D0%BF%D0%BE%D1%80%D1%96%D0%B4';
const WIKIPEDIA_AGENT = 'CoolTool/0.0 (https://example.org/cool-tool/; cool-tool@example.org) generic-library/0.0';

const CATS_TABLE_QUERY_SELECTOR = '.wikitable.sortable tbody tr';

const PHOTOS_FOLDER = 'photos';
const PHOTO_COLUMN_QUERY_SELECTOR = '.image';
const FIRST_LINK_ROW_QUERY_SELECTOR = 'td a'

const PARSED_FILE = 'parsed.txt';
const EN_LANG = 'en';
const RU_LANG = 'ru';


main();

async function main() {
    if (!(await exists(PHOTOS_FOLDER)))
        await fs.mkdir(PHOTOS_FOLDER);

    const response = await axios.get(CAT_URL);

    const root = parse(response.data);
    const rows = root.querySelectorAll(CATS_TABLE_QUERY_SELECTOR);

    //first and last rows are unrelated to the data
    rows.pop();
    rows.shift();

    await Promise.all(rows.map(async row => {
        const firstRowColumnWithATag = row.querySelector(FIRST_LINK_ROW_QUERY_SELECTOR);
        const breedNameUa = firstRowColumnWithATag.firstChild.text;

        const photoColumn = row.querySelector(PHOTO_COLUMN_QUERY_SELECTOR);

        const photoFilePath = `${PHOTOS_FOLDER}/${breedNameUa}.jpg`;

        if (await exists(photoFilePath))
            return;

        let photoUrl = 'NO IMAGE FOUND';

        if (photoColumn && photoColumn.firstChild) {
            const noScriptNode = photoColumn.firstChild;
            const imgNode = parse(noScriptNode.text);

            let source = imgNode.firstChild.getAttribute('src');

            photoUrl = `https:${source}`;

            const data = await download(photoUrl);
            //we don't await to download parallelly(asynchronous)
            fs.writeFile(photoFilePath, data);
        }

        const breedNameRuObj = await translate(breedNameUa, { to: RU_LANG });
        const breedNameEnObj = await translate(breedNameUa, { to: EN_LANG });

        await fs.appendFile(PARSED_FILE, `${breedNameUa},${breedNameRuObj.text},${breedNameEnObj.text}${newLine()}`)
    }));
}

async function exists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    } catch (err) {
        return false;
    }
}

async function download(url) {
    try {
        const response = await axios.get(url, {
            responseType: 'arraybuffer',
            headers: {
                'User-Agent': WIKIPEDIA_AGENT
            },
            validateStatus: () => true
        });

        if (response.status != 200) {
            throw new Error(`not success status from ${url}, actual status: ${response.status}`)
        }

        return response.data;
    }
    catch (err) {
        console.log(err)
    }
}

function newLine() {
    return '\r\n';
}