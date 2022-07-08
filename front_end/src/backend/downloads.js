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

// In these functions the 'fileName' parameter variables refer to filenames of '2mib.txt' '64mib.txt' and '256mib.txt'.
import { REGIONS_MAP, FILESIZE_BYTES, FILESIZE_MIB } from './common.js';
import axios from 'axios';

/**
 * Measure time to download files from a bucket to memory and get relevant benchmarks.
 */
export class Downloads {
    _builtURL;
    
    /**
     * Measures time in milliseconds taken to download a file from a bucket to memory as specified by the input URL.
     * Returns -1 if download fails. 
     * 
     * @private
     * @param {string} URL - URL to send HTTP GET request.
     * @returns {number}
     */
    async downloadFile(URL) {
        this._builtURL = URL;
        try {
            const start = performance.now();
            await axios.get(URL);
            return performance.now() - start;
        } catch (e) {
            return -1;
        }
    }

    /**
     * This function constructs a URL of the file to be downloaded. 
     * Returns elapsed time converted from milliseconds to seconds. 
     * 
     * @throws {Error} If fileName is not one of enum values in FILESIZES_NAMES defined in common.js.
     * @throws {Error} If bucket is not one of the enum values in REGIONS_MAP defined in common.js.
     * 
     * @param {string} fileName 
     * @param {string} bucket 
     * @returns {number}
     */
    async timeDownload(fileName, bucket) {
        if (fileName != 'wrongFile' && bucket != 'wrongBucket') {
            if (!(fileName in FILESIZE_BYTES) || !(fileName in FILESIZE_MIB)) {
                let errorMessage = `Invalid File Name: '${fileName}'. File names must be any of "2mib.txt", "64mib.txt" or "256mib.txt"`
                throw new Error(errorMessage);
            }
            if (!(bucket in REGIONS_MAP)) {
                let errorMessage = `Invalid Bucket Name: '${bucket}'. Bucket must be a supported Google Cloud Storage Region Name. View https://cloud.google.com/storage/docs/locations for more information.`
                throw new Error(errorMessage);
            }
        }

        const bucketName = `gcsrbpa-${bucket}`;

        const URL = `https://storage.googleapis.com/${bucketName}/${fileName}`;

        const timeTaken = await this.downloadFile(URL);
        return timeTaken / 1000; // return in units of seconds
    }

    /**
     * Runs download benchmark and returns a HashMap with keys 'bucketName', 'location', 'fileName', 
     * 'timeTaken', 'fileSizeBytes', 'speedBps', 'speedMiBps'. HashMap values are stringified results.
     * 
     * @param {string} fileName 
     * @param {string} bucketName 
     * @returns {Map.<string, string>}
     */
    async benchmarkSingleDownload(fileName, bucketName) {
        let result = new Map();
        const timeTaken = await this.timeDownload(fileName, bucketName);

        let fileSizeBytes = FILESIZE_BYTES[fileName] || fileName;
        let fileSizeMiB = FILESIZE_MIB[fileName] || fileName;
        let location = REGIONS_MAP[bucketName] || bucketName;

        const speedBps = (fileSizeBytes / timeTaken) || -1;
        const speedMiBps = (fileSizeMiB / timeTaken) || -1;

        result.set('bucketName', bucketName);
        result.set('location', location);
        result.set('fileName', fileName);
        result.set('timeTaken', timeTaken.toFixed(3));
        result.set('fileSizeBytes', fileSizeBytes);
        result.set('speedBps', speedBps.toFixed(3));
        result.set('speedMiBps', speedMiBps.toFixed(3));

        return result;
    }

    /**
     * Runs download benchmark and returns HashMap of results wrapped in an Array.
     * 
     * @param {string} fileName 
     * @param {string} bucketName 
     * @returns {Map.<string, string>[]}
     */
    async benchmarkDownload(fileName, bucketName) {
        const result = await this.benchmarkSingleDownload(fileName, bucketName);

        let arr = new Array();
        arr.push(Object.fromEntries(result));
        return arr;
    }
}
