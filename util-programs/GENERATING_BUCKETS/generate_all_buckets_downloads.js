/*
The goal of this file is:
1) Create buckets for all single region locations in https://cloud.google.com/storage/docs/locations#location-r
    - Each bucket must use the naming convention 'gcsrbpa'+regionName
    - Each bucket must be created with access control 'fine grained', 
    - Each bucket must have public access status be set to 'Subject to object ACLs'
    - location type should be single 'region'
    - storage class: standard.

2) Uploading files
    - must follow naming convention of '2mib.txt', '64mib.txt', or '256mib.txt'
    - turn off caching for each file
*/

const { Storage } = require('@google-cloud/storage');
const storage = new Storage();

function makeBucket(regionName) {
    let bucketName = 'gcsrbpa-'+regionName.toString().toLowerCase();
    let location = regionName.toUpperCase();

    async function createBucket() {
        const [bucket] = await storage.createBucket(bucketName, {
            location: location,
            storageClass: 'STANDARD',
            locationType: 'region',
        });

        await storage.bucket(bucketName).acl.default
    }

    console.log(`${bucketName} has been created!`)
    createBucket().catch(console.error);
}

var jsonData = require('../regions.json');

for (const [key, value] of Object.entries(jsonData)) {
    // console.log(key)
    makeBucket(key)
}
  