/**
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// In these functions the 'fileName' parameter letiables refer to filenames of '2mib.txt' '64mib.txt' and '256mib.txt'
export const REGIONS_MAP = {
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
};


async function timeDownload(fileName, bucket) {
    const axios = require('axios');
    const bucketName = 'gcsrbpa-' + bucket;

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

async function benchmarkSingleDownload(fileName, bucketName) {
    let result = new Map();
    const timeTaken = await timeDownload(fileName, bucketName);

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
    result.set('location', REGIONS_MAP[bucketName]);
    result.set('fileName', fileName);
    result.set('timeTaken', timeTaken);
    result.set('fileSizeBytes', fileSizeBytes.toString());
    result.set('speedBps', speedBps.toFixed(3));
    result.set('speedMiBps', speedMiBps.toFixed(3));

    return result;
}

export async function benchmarkDownload(fileName, bucketName) {
    const result = await benchmarkSingleDownload(fileName, bucketName, REGIONS_MAP);

    console.log(`Completed Downloads Benchmark for ${bucketName}`);

    let arr = new Array()
    arr.push(Object.fromEntries(result))
    return JSON.stringify(arr);
}
