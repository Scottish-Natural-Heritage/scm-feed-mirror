//#region Constants

/**
 * Where to pull the mirrored data from.
 */
 const realApiEndpoint = 'https://apps.snh.gov.uk/SCMFeed/sites';

//#endregion
 
//#region method to fetch data from real API

const getDataFromRealAPI = async () => {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    const response = await fetch(realApiEndpoint, headers);
    return response;
}
 
//#endregion

//#region Main Script

const realApiData = await getDataFromRealAPI();
console.log('here2', realApiData.ok);
 
//#endregion
 