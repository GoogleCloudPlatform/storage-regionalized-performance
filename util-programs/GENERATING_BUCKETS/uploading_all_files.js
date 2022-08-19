const { Storage } = require('@google-cloud/storage');
const storage = new Storage();


// now that bucket has been created, lets upload files and also set them to public!
// Example use: uploadObjects('gcsrbpa-us-west2', '../files/2mib.txt', '2mib.txt');
function uploadObjects(bucketName, filePath, destFileName) {
    async function upload(bucketName, filePath, destFileName) {
        // upload the file.
        await storage.bucket(bucketName).upload(filePath, {
            destination: destFileName,
        });

        console.log(`${filePath} uploaded to ${bucketName}`);

        // making the file public
        await storage.bucket(bucketName).file(destFileName).makePublic();

        console.log(`${destFileName} in ${bucketName} made public`);

        // setting cache control OFF
        const [metadata] = await storage.bucket(bucketName).file(destFileName).setMetadata({
            contentType: 'text/plain',
            cacheControl: 'no-store',
        })

        // console.log(metadata);
        console.log(`metadata updated for ${bucketName} ${destFileName}`)

    }
    upload(bucketName, filePath, destFileName).catch(console.error);
}

function makeBucketAndUploadFiles(regionName) {
    let bucketName = 'gcsrbpa-' + regionName.toString().toLowerCase();
    uploadObjects(bucketName, '../files/2mib.txt', '2mib.txt');
    uploadObjects(bucketName, '../files/64mib.txt', '64mib.txt');
    uploadObjects(bucketName, '../files/256mib.txt', '256mib.txt');
}

// makeBucketAndUploadFiles('us-west2');

var jsonData = require('../regions.json');

for (const [key, value] of Object.entries(jsonData)) {
    makeBucketAndUploadFiles(key);
}