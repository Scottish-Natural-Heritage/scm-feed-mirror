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
    const response = await repeatedlyAttempt(callRealApiAndCheckOk, [url], 10);
    const apiJson = await response.json(); // This will error if the response is not JSON
    // The big lump and individual site have identical structures
    if (!checkJsonLooks(apiJson)) {
        throw new Error('The JSON does not have the required structure');
    }
    return apiJson;
}

const callRealApiAndCheckOk = async (url) => {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    const response = await fetch(url, {headers});
    // Error if fetch fails.
    if (!response.ok) {
        throw new Error('Failed to fetch', url);
    }
    return response;
}
 
//#endregion

//#region Formatters and helpers

const prettyJson = (jsonData) => {
    return JSON.stringify(jsonData, undefined, '\t');
}

const getDirectoryPath = (paCode) => {
    if (paCode) {
        return resolve(baseRoot, baseUrl, paCode);
    } else {
        return resolve(baseRoot, baseUrl);
    }
}

const checkJsonLooks = (jsonData) => {

    // The top node should have two properties
    if (!(
        jsonData instanceof Object
        // NB as the properties are readOnly the `blah.hasOwnProperty('blah')` approach does NOT work
        && 'refreshDateTime' in jsonData
        && 'Site' in jsonData
    )) {
        return false;
    }

    // The Site node should be an array of at least 1 object    
    if (!(
        jsonData.Site instanceof Array
        && jsonData.Site.length > 0
        && jsonData.Site[0] instanceof Object
    )) {
        return false;
    }

    // The first Site should have a few site-like properties    
    if (!(
        'Code' in jsonData.Site[0]
        && 'SiteName' in jsonData.Site[0]
        && 'SiteDesignation' in jsonData.Site[0]
        && 'ProtectedOverlays' in jsonData.Site[0]
        && 'SiteFeature' in jsonData.Site[0]
    )) {
        return false;
    }

    return true;
}

//#endregion

//#region methods to repeat a function on error

const pause = async (milliseconds) => {
    // Wait for a wee bit before resolving the promise.
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

const repeatedlyAttempt = async (func, args, attempts) => {
    try {
        // Try the function with the supplied arguments.
        const result = await func(...args);

        // Return the result if it's successful.
        return result;
        // If it failed...
    } catch {
        // Tell the user that one attempt failed.
        console.log('Attempted, but failed.')

        // If we still have some attempts...
        if (attempts) {
            // Tell the user how many remain.
            console.log(`${attempts} attempts remain.`);

            // Let the server catch it's breath for a couple of seconds in case
            // we're hammering it in to the ground.
            await pause(2000);

            // Try again, crossing our fingers.
            return await repeatedlyAttempt(func, args, --attempts);
        }

        // If we have no attempts left. Throw an error and stop.
        throw new Error('Repeatedly attempted, but continually failed. Cannot continue.')
    }
}

//#endregion


//#region Save a file in a directory

const writeFileWithinOwnDirectory = async (jsonData, paCode) => {
    const directoryPath = getDirectoryPath(paCode);
    const filePath = resolve(directoryPath, 'index.json');
    // Create the directory for saving and serving the mirrored data.
    await mkdir(directoryPath, { recursive: true });
    // And pop the JSON data in a git diff friendly way.
    await writeFile(filePath, prettyJson(jsonData), { encoding: 'utf8' });
}
 
//#endregion

//#region Main Script

// Get the big lump of data
console.log('Fetching the data from the real API');
const realApiJsonData = await getDataFromRealAPI(realApiEndpoint);

// Save the really big file as an 'index' file.
console.log('Saving the main file');
await writeFileWithinOwnDirectory(realApiJsonData);

// Loop through the sites in the big file
for (const site of realApiJsonData.Site) {
    console.log('Fetching site with PA code', site.Code);
    const realApiJsonDataSite = await getDataFromRealAPI(realApiEndpoint + `/${site.Code}`);
    console.log('Saving the individual file for PA', site.Code);
    await writeFileWithinOwnDirectory(realApiJsonDataSite, site.Code);
}

console.log('All done!');

//#endregion
 