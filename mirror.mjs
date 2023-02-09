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

const getDataFromRealAPI = async () => {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    const response = await fetch(realApiEndpoint, {headers});
    // TODO: We are going to add sanity checks here
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
const realApiJsonData = await getDataFromRealAPI();

// Save it as an 'index' file.
console.log('Saving the main file');
const filePath = resolve(baseRoot, baseUrl, 'index.json');
await writeFile(filePath, prettyJson(realApiJsonData), { encoding: 'utf8' });

console.log('All done!');

//#endregion
 