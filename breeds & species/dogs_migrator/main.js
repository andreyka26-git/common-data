const axios = require('axios');
const https = require('https');
const { parse } = require('node-html-parser');
const fs = require('fs').promises;
const translate = require('@vitalets/google-translate-api');
const Path = require('path');

const DOG_ROOT_URL = 'https://xn--80atyad7e.xn--p1ai';
const DOG_URL = `${DOG_ROOT_URL}/uk/%D0%9F%D0%BE%D1%80%D0%BE%D0%B4%D1%8B`

const DOG_ITEM_SELECTOR = '.card__image.b-selection__item-image';

const PHOTOS_FOLDER = 'photos';
const PARSED_FILE = 'parsed.txt';
const ERROR_LOG_FILE = 'error_log.txt';
const EN_LANG = 'en';
const RU_LANG = 'ru';

main();

async function main() {
     try {
        if (await exists(ERROR_LOG_FILE))
            await fs.rm(ERROR_LOG_FILE);
    } catch (err) {
        console.log(`init error, ${err}`);
        throw err;
    }

    if (!(await exists(PHOTOS_FOLDER)))
        await fs.mkdir(PHOTOS_FOLDER);

    const response = await axios.get(DOG_URL, {
        httpsAgent: new https.Agent({
            rejectUnauthorized: false
        })
    });

    const root = parse(response.data);
    const rows = root.querySelectorAll(DOG_ITEM_SELECTOR);

    await Promise.all(rows.map(async row => {
        const breedNameUa = row.getAttribute('alt');
        const photoUrl = `${DOG_ROOT_URL}${row.getAttribute('src')}`;

        const filePath = `${PHOTOS_FOLDER}/${breedNameUa}.jpg`;

        if (await exists(filePath))
            return;

        try {
            console.log(`started downloading`);
            const data = await download(photoUrl);
            console.log(`downloaded. ${breedNameUa}`);
            //we don't await to download parallelly(asynchronous)

            fs.writeFile(filePath, data);
        } catch (error) {
            console.log(`not downloaded. ${breedNameUa}`);
            await fs.appendFile(ERROR_LOG_FILE, `error occurred while downloading for ${breedNameUa}, ${photoUrl}, error: ${error}${newLine()}`);
        }

        const breedNameRuObj = await translate(breedNameUa, { to: RU_LANG });
        const breedNameEnObj = await translate(breedNameUa, { to: EN_LANG });

        await fs.appendFile(PARSED_FILE, `${breedNameUa},${breedNameRuObj.text},${breedNameEnObj.text}${newLine()}`);
    }))
}

function newLine() {
    return '\r\n';
}

async function download(url) {
    const response = await axios.get(url, {
        responseType: 'arraybuffer',
        validateStatus: () => true,
        httpsAgent: new https.Agent({
            rejectUnauthorized: false
        })
    });

    if (response.status != 200) {
        throw new Error(`not success status from ${url}, actual status: ${response.status}`)
    }

    return response.data;
}

async function removeDir(directoryPath) {
    if (!(await exists(directoryPath)))
        return;

    const files = await fs.readdir(directoryPath);

    await Promise.all(files.map(async file => {
        const curPath = Path.join(directoryPath, file);

        if ((await fs.lstat(curPath)).isDirectory()) {
            await removeDir(curPath);
        } else {
            await fs.unlink(curPath);
        }
    }))
    await fs.rmdir(directoryPath);
};

async function exists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    } catch (err) {
        return false;
    }
}