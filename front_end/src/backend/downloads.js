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

// In these functions the 'fileName' parameter variables refer to filenames of '2mib.txt' '64mib.txt' and '256mib.txt'
import { REGIONS_MAP, FILESIZE_BYTES, FILESIZE_MIB } from "./common.js";

import axios from "axios";
export async function downloadFile(URL) {
    try {
        const start = Date.now();
        await axios.get(URL);
        const end = Date.now() - start;
        return end;
    } catch (e) {
        return -1;
    }
}

export async function timeDownload(fileName, bucket) {
    const bucketName = 'gcsrbpa-' + bucket;

    const URL = `https://storage.googleapis.com/${bucketName}/${fileName}`;

    const timeTaken = await downloadFile(URL);
    return timeTaken / 1000; // return in units of seconds
}

export async function benchmarkSingleDownload(fileName, bucketName) {
    let result = new Map();
    const timeTaken = await timeDownload(fileName, bucketName);

    let fileSizeBytes = FILESIZE_BYTES[fileName];
    let fileSizeMiB = FILESIZE_MIB[fileName];

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
    const result = await benchmarkSingleDownload(fileName, bucketName);

    console.log(`Completed Downloads Benchmark for ${bucketName}`);

    let arr = new Array();
    arr.push(Object.fromEntries(result));
    return JSON.stringify(arr);
}
