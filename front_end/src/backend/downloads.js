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
import { REGIONS_MAP, FILESIZE_BYTES, FILESIZE_MIB, DEFAULT_TIME_TAKEN, FLOAT_ROUND_DIGITS } from './common.js';
import axios from 'axios';

/**
 * Measure time to download files from a bucket to memory and get relevant benchmarks.
 */
export class Downloads {
    _builtURL;

    /**
     * Measures time (in milliseconds) to download a file from a bucket to memory as specified by the input URL.
     * 
     * @private
     * @param {string} URL - URL to send HTTP GET request.
     * @returns {number} -1 if download fails - so that a sequence of benchmarks can continue running even if one fails. 
     */
    async getDurationOfGetRequest(URL) {
        this._builtURL = URL;
        try {
            const start = performance.now();
            await axios.get(URL);
            return performance.now() - start;
        } catch (e) {
            return DEFAULT_TIME_TAKEN;
        }
    }

    /**
     * This function constructs a URL of the file to be downloaded. 
     * 
     * @throws {Error} If fileName is not one of enum values in FILESIZES_NAMES defined in common.js.
     * @throws {Error} If bucket is not one of the enum values in REGIONS_MAP defined in common.js.
     * 
     * @param {string} fileName 
     * @param {string} bucket 
     * @returns {number} Returns elapsed time converted from milliseconds to seconds. 
     */
    async getDurationInSeconds(fileName, bucket) {
        if (!(fileName in FILESIZE_BYTES) || !(fileName in FILESIZE_MIB)) {
            let errorMessage = `Invalid File Name: '${fileName}'. File names must be any of "2mib.txt", "64mib.txt" or "256mib.txt"`
            throw new Error(errorMessage);
        }
        if (!(bucket in REGIONS_MAP)) {
            let errorMessage = `Invalid Bucket Name: '${bucket}'. Bucket must be a supported Google Cloud Storage Region Name. View https://cloud.google.com/storage/docs/locations for more information.`
            throw new Error(errorMessage);
        }

        const bucketName = `gcsrbpa-${bucket}`;

        const URL = `https://storage.googleapis.com/${bucketName}/${fileName}`;

        const timeTaken = await this.getDurationOfGetRequest(URL);

        return timeTaken / 1000; // return in units of seconds
    }

    /**
     * Runs download benchmark and returns an Array of an Object keys 'bucketName', 'location', 'fileName', 
     * 'timeTaken', 'fileSizeBytes', 'speedBps', 'speedMiBps'. 
     * All numerical results are rounded to three decimal places.
     * All Object values are strings.
     * 
     * @param {string} fileName 
     * @param {string} bucketName 
     * @returns {Object.<string, string>[]} 
     */
    async benchmarkSingleDownload(fileName, bucketName) {
        const timeTaken = await this.getDurationInSeconds(fileName, bucketName);

        let fileSizeBytes = FILESIZE_BYTES[fileName] || fileName;
        let fileSizeMiB = FILESIZE_MIB[fileName] || fileName;
        let location = REGIONS_MAP[bucketName] || bucketName;

        const speedBps = (fileSizeBytes / timeTaken) || DEFAULT_TIME_TAKEN;
        const speedMiBps = (fileSizeMiB / timeTaken) || DEFAULT_TIME_TAKEN;

        let result = [{
            'bucketName': bucketName,
            'location': location,
            'fileName': fileName,
            'timeTaken': timeTaken.toFixed(FLOAT_ROUND_DIGITS),
            'fileSizeBytes': String(fileSizeBytes),
            'speedBps': speedBps.toFixed(FLOAT_ROUND_DIGITS),
            'speedMiBps': speedMiBps.toFixed(FLOAT_ROUND_DIGITS),
        }]

        return result;
    }
}
