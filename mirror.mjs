//#region Imports

import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

//#endregion

//#region Constants

/**
 * Where to pull the mirrored data from.
 */
 const realApiEndpoint = 'https://apps.snh.gov.uk/SCMFeed/sites';

/**
 * Where to save the mirrored files to.
 */
 const baseRoot = 'mirror';

 /**
  * Where to re-host the mirrored files from.
  */
 const baseUrl = 'scm-feed/sites';

//#endregion
 
//#region Method to fetch data from real API

const getDataFromRealAPI = async (url) => {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    const response = await fetch(url, {headers});
    // TODO: We are going to add sanity checks here
    // The big lump and individual site have identical structures
    const apiJson = await response.json();
    return apiJson;
}
 
//#endregion 

//#region Formatters

const prettyJson = (jsonData) => {
    return JSON.stringify(jsonData, undefined, '\t');
}
 
//#endregion

//#region Main Script

// Create the base directory for saving and serving the mirrored data.
const basePath = resolve(baseRoot, baseUrl);
await mkdir(basePath, { recursive: true });

// Get the big lump of data
console.log('Fetching the data from the real API');
const realApiJsonData = await getDataFromRealAPI(realApiEndpoint);

// Save the really big file as an 'index' file.
console.log('Saving the main file');
const filePath = resolve(baseRoot, baseUrl, 'index.json');
await writeFile(filePath, prettyJson(realApiJsonData), { encoding: 'utf8' });

// Loop through the sites in the big file
for (const site of realApiJsonData.Site) {
    console.log('Fetching site with PA code', site.Code);
    const realApiJsonDataSite = await getDataFromRealAPI(realApiEndpoint + `/${site.Code}`);
    console.log('Saving the individual file for PA', site.Code);
    const sitePath = resolve(baseRoot, baseUrl, `${site.Code}`);
    const filePath = resolve(sitePath, 'index.json');
    await mkdir(sitePath, { recursive: true });
    await writeFile(filePath, prettyJson(realApiJsonDataSite), { encoding: 'utf8' });
}

console.log('All done!');

//#endregion
 