// In these functions the 'fileName' parameter letiables refer to filenames of '2mib.txt' '64mib.txt' and '256mib.txt'
const rawData = `{
    "northamerica-northeast1":"Montréal",
    "northamerica-northeast2":"Toronto",
    "us-central1":"Iowa",
    "us-east1":"South Carolina",
    "us-east4":"Northern Virginia",
    "us-east5":"Columbus",
    "us-south1":"Dallas",
    "us-west1":"Oregon",
    "us-west2":"Los Angeles",
    "us-west3":"Salt Lake City",
    "us-west4":"Las Vegas",
    "southamerica-east1":"São Paulo",
    "southamerica-west1":"Santiago",
    "europe-central2":"Warsaw",
    "europe-north1":"Finland",
    "europe-southwest1":"Madrid",
    "europe-west1":"Belgium",
    "europe-west2":"London",
    "europe-west3":"Frankfurt",
    "europe-west4":"Netherlands",
    "europe-west6":"Zürich",
    "europe-west8":"Milan",
    "europe-west9":"Paris",
    "asia-east1":"Taiwan",
    "asia-east2":"Hong Kong",
    "asia-northeast1":"Tokyo",
    "asia-northeast2":"Osaka",
    "asia-northeast3":"Seoul",
    "asia-south1":"Mumbai",
    "asia-south2":"Delhi",
    "asia-southeast1":"Singapore",
    "asia-southeast2":"Jakarta",
    "australia-southeast1":"Sydney",
    "australia-southeast2":"Melbourne"
}`;
let regionsJSON = JSON.parse(rawData);


async function timed_download(fileName, bucket) {
    const axios = require('axios');
    const bucketName = 'gcsrbpa-' + bucket;

    // Build the URL - example: https://storage.googleapis.com/gcsrbpa-asia-southeast2/256mib.txt
    // `https://storage.googleapis.com/${bucketName}/${fileName}`

    const URL = `https://storage.googleapis.com/${bucketName}/${fileName}`;

    async function downloadFile() {
        const start = Date.now();
        await axios.get(URL)
        const end = Date.now() - start;
        return end;
    }

    const timeTaken = await downloadFile();
    return timeTaken / 1000; // return in units of seconds
}

async function benchmark_single_download(fileName, bucketName, regionsJSON) {
    let result = new Map();
    const timeTaken = await timed_download(fileName, bucketName);

    // Add one for throughput or bytes/second
    let fileSizeBytes = 0;
    let fileSizeMiB = 0;
    if (fileName == '2mib.txt') {
        fileSizeBytes = 2097152;
        fileSizeMiB = 2;
    } else if (fileName == '64mib.txt') {
        fileSizeBytes = 67108864;
        fileSizeMiB = 64;
    } else if (fileName == '256mib.txt') {
        fileSizeBytes = 268435456;
        fileSizeMiB = 256;
    }
    const speedBps = fileSizeBytes / timeTaken;
    const speedMiBps = fileSizeMiB / timeTaken;

    result.set('bucketName', bucketName);
    result.set('location', regionsJSON[bucketName]);
    result.set('fileName', fileName);
    result.set('timeTaken', timeTaken);
    result.set('fileSizeBytes', fileSizeBytes.toString());
    result.set('speedBps', speedBps.toFixed(3));
    result.set('speedMiBps', speedMiBps.toFixed(3));

    return result;
}

// a function that cycles through all buckets and returns all the times in a HashMap
async function benchmark_all_downloads(fileName) {
    console.log(`Beginning Benchmarking for ${fileName}`);


    let bucketResults = new Array()
    for (let bucketName in regionsJSON) {
        const result = await benchmark_single_download(fileName, bucketName, regionsJSON);
        bucketResults.push(Object.fromEntries(result))

        console.log(`Completed Downloads Benchmark for ${bucketName}`);
    }

    return bucketResults;
}

async function benchmark_download(fileName, bucketName, log) {
    const result = await benchmark_single_download(fileName, bucketName, regionsJSON);

    console.log(`Completed Downloads Benchmark for ${bucketName}`);

    if (log == 'log') {
        console.log(result)
    }

    let arr = new Array()
    arr.push(Object.fromEntries(result))
    return JSON.stringify(arr);
}

async function benchmark_downloads(fileName, log) {
    const allBucketsResults = await benchmark_all_downloads(fileName);

    if (log == 'log') {
        console.log(allBucketsResults);
    }

    return JSON.stringify(allBucketsResults);
}

exports.benchmark_downloads = benchmark_downloads;
exports.benchmark_download = benchmark_download;
exports.regions_json = regionsJSON;