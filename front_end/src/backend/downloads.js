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
import { REGIONS_MAP, FILESIZE_BYTES, FILESIZE_MIB } from './common.js';
import axios from 'axios';

export class Downloads {
    _builtURL;

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

    async benchmarkDownload(fileName, bucketName) {
        const result = await this.benchmarkSingleDownload(fileName, bucketName);

        let arr = new Array();
        arr.push(Object.fromEntries(result));
        return JSON.stringify(arr);
    }
}
