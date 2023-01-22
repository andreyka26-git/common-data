const axios = require('axios');
const https = require('https');
const { parse } = require('node-html-parser');
const fs = require('fs').promises;
const translate = require('@vitalets/google-translate-api');
const Path = require('path');

const PARROTS_URL = 'https://www.allpetbirds.com/types-of-parrots';

const PARROTS_ITEM_SELECTOR = '.av-inner-masonry.main_color';
const PARROTS_PHOTO_CONTAINER_SELECTOR = '.av-masonry-image-container';
const PARROTS_INNER_TEXT_CONTAINER_SELECTOR = '.av-inner-masonry-content-pos';

const PHOTOS_FOLDER = 'photos';
const PARSED_FILE = 'parsed.txt';
const ERROR_LOG_FILE = 'error_log.txt';
const UA_LANG = 'uk';
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

    const response = await axios.get(PARROTS_URL, {
        httpsAgent: new https.Agent({
            rejectUnauthorized: false
        })
    });

    const root = parse(response.data);
    const rows = root.querySelectorAll(PARROTS_ITEM_SELECTOR);

    await Promise.all(rows.map(async row => {
        const photoUrl = row.querySelector(PARROTS_PHOTO_CONTAINER_SELECTOR).firstChild.getAttribute('src');
        let breedNameEn = row.querySelector(PARROTS_INNER_TEXT_CONTAINER_SELECTOR).innerText;

        //this is for '&' removing
        breedNameEn = breedNameEn.replace("&#038;", "and");

        console.log('breedname: ' + breedNameEn);

        const breedNameRuObj = await translate(breedNameEn, { to: RU_LANG });
        const breedNameUaObj = await translate(breedNameEn, { to: UA_LANG });
        const breedNameUa = breedNameUaObj.text;
        

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

        await fs.appendFile(PARSED_FILE, `${breedNameUa},${breedNameRuObj.text},${breedNameEn}${newLine()}`);
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