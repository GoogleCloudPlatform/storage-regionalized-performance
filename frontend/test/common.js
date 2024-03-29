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

/**
 * Error message returned when a method is called with an invalid filename
 * @const {string}
 */
export const ERR_MSG_INVALID_FILE = `Invalid File Name: 'random_file_name'.` + 
    ` File names must be any of "2mib.txt", "64mib.txt" or "256mib.txt"`;

/**
 * Error message returned when a method is called with an invalid bucket name
 * @const {string}
 */
export const ERR_MSG_INVALID_BUCKET = `Invalid Bucket Name: 'random_bucket_name'.` + 
    ` Bucket must be a supported Google Cloud Storage Region Name.` + 
    ` View https://cloud.google.com/storage/docs/locations for more information.`;

/**
 * Contents of the smallest (2mib) filesize used for uploads/downloads
 * @const {string}
 */
export const FILE_CONTENTS_2MIB = '\x00'.repeat(2097152);

/**
 * Fake function used to stub performance.now()
 * @returns {number} Returns 1. 
 */
export function fakePerformanceNow() {
    return 1;
}