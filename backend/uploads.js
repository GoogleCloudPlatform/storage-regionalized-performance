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
import axios from 'axios';
import { REGIONS_MAP, FILESIZE_BYTES, FILESIZE_MIB, FLOAT_ROUND_DIGITS, DEFAULT_TIME_TAKEN } from './common.js';

/**
 * Strings of fixed length to be used as contents of an 
 * uploaded file during an upload benchmark.
 * @enum {string}
 */
const FILE_CONTENTS = Object.freeze({
    '2mib.txt': '\x00'.repeat(2097152),
    '64mib.txt': '\x00'.repeat(67108864),
    '256mib.txt': '\x00'.repeat(268435456),
});

/**
 * MD5 Checksums of contents of each string that is uploaded.
 * @enum {string}
 */
const MD5_SUMS = Object.freeze({
    '2mib.txt': 'stEjbChqPAcEIk/kEF7KSQ==',
    '64mib.txt': 'f2FNqTKc066/WbkarcML8A==',
    '256mib.txt': 'H1A55QvWaykMVmhNhVDGwg=='
});

/**
 * Measure time to upload files to a bucket from memory and get relevant benchmarks.
 */
export class Uploads {
    /**
     * Get signed URL to be used to upload a file through a PUT request. 
     * 
     * @param {string} fileName 
     * @param {string} bucketName 
     * @returns {string} Returns a signed URL.
     */
    async getSignedURL(fileName, bucketName) {
        // The signed URL Source is set to localhost now, but will either use env variables or another website during deployment
        const signedUrlSource = `http://localhost:3000/${bucketName}/${fileName}`;

        let response;
        try {
            response = await axios.get(signedUrlSource);
        } catch (e) {
            throw new Error(`Failed to reach server to get signedURL: ${e}`);
        }

        return response.data;
    }

    /**
     * Measures time in seconds to upload a file to a bucket via a PUT request.
     * The PUT request has maxContentLength and maxBodyLength set to Infinity to allow for uploads of large file sizes.
     * The PUT request has 'x-goog-content-length-range' set as a header attribute to only allow uploads of the right file size.
     * 
     * @throws {Error} If fileName is not one of enum values in FILESIZES_NAMES defined in common.js.
     * @throws {Error} If bucketName is not one of the enum values in REGIONS_MAP defined in common.js.
     * 
     * @param {string} fileName 
     * @param {string} bucketName 
     * @returns {number} Returns -0.001 if upload fails - so that a sequence of benchmarks can continue running even if one fails. 
     */
    async getDurationOfUpload(fileName, bucketName) {
        if (!(fileName in FILESIZE_BYTES) || !(fileName in FILESIZE_MIB)) {
            let errorMessage = `Invalid File Name: '${fileName}'. File names must be any of "2mib.txt", "64mib.txt" or "256mib.txt"`
            throw new Error(errorMessage);
        }
        if (!(bucketName in REGIONS_MAP)) {
            let errorMessage = `Invalid Bucket Name: '${bucketName}'. Bucket must be a supported Google Cloud Storage Region Name. View https://cloud.google.com/storage/docs/locations for more information.`
            throw new Error(errorMessage);
        }

        const fullBucketName = `gcsrbpa-upload-${bucketName}`;

        const url = await this.getSignedURL(fileName, fullBucketName);

        const axiosOptions = {
            headers: {
                'Content-Type': 'text/plain',
                'Content-Md5': MD5_SUMS[fileName],
                'x-goog-content-length-range': `${FILESIZE_BYTES[fileName]},${FILESIZE_BYTES[fileName]}`,
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        };

        let timeTakenMilliSeconds = DEFAULT_TIME_TAKEN;
        try {
            let start = performance.now();
            await axios.put(url, FILE_CONTENTS[fileName], axiosOptions)
            timeTakenMilliSeconds = performance.now() - start;
        } catch (e) {
            // Error caught without further handling for now - this will be extended with retries/other handling in the future.
            // In case of an error, the final result currently renders 'bad' values (e.x. timeTaken is negative)
        }

        return timeTakenMilliSeconds / 1000;
    }

    /**
     * Runs an upload benchmark and returns an Array of an Object keys 'bucketName', 'location', 'fileName', 
     * 'timeTaken', 'fileSizeBytes', 'speedBps', 'speedMiBps'. 
     * All numerical results are rounded to three decimal places.
     * All Object values are strings.
     * 
     * @param {string} fileName 
     * @param {string} bucketName 
     * @returns {Object.<string, string>[]}
     */
    async benchmarkSingleUpload(fileName, bucketName) {
        const timeTaken = await this.getDurationOfUpload(fileName, bucketName);

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
