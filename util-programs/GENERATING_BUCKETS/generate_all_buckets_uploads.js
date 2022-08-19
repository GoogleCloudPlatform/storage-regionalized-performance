/*
The goal of this file is:
1) Create buckets for all single region locations in https://cloud.google.com/storage/docs/locations#location-r
    - Each bucket must use the naming convention 'gcsrbpa-upload'+regionName
    - Each bucket must be created with access control 'uniform', 
    - Each bucket must have public access status be set to 'Not Public'
    - location type should be single 'region'
    - storage class: standard.
    - lifecycle rules:
    	- delete if object was last updated 1 day ago
		- delete if object was last 


*/

const { Storage } = require('@google-cloud/storage');
const storage = new Storage();

function makeBucket(regionName) {
    let bucketName = 'gcsrbpa-upload-'+regionName.toString().toLowerCase();
    let location = regionName.toUpperCase();

    async function createBucket() {
        const [bucket] = await storage.createBucket(bucketName, {
            location: location,
            storageClass: 'STANDARD',
            locationType: 'region',
        });

        // setting required properties for the new bucket
        await storage.bucket(bucketName).setMetadata({
            iamConfiguration: {
              uniformBucketLevelAccess: {
                enabled: true,
              },
              publicAccessPrevention: 'enforced',
            },
          });

        await storage.bucket(bucketName).addLifecycleRule({
          action: 'delete',
          condition: {age: 1}
        });        
        await storage.bucket(bucketName).addLifecycleRule({
          action: 'delete',
          condition: {matchesPrefix: ['2mib.txt', '256mib.txt', '64mib.txt']}
        })
    }

    console.log(`${bucketName} has been created!`)
    createBucket().catch(console.error);
}

var jsonData = require('../regions.json');

for (const [key, value] of Object.entries(jsonData)) {
    console.log(key);
    makeBucket(key);
}
  

