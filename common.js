/**
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * All supported Google Cloud Storage single bucket regions and their
 * associated Locations
 * See {@link https://cloud.google.com/storage/docs/locations}
 * @enum {string}
 */
export const REGIONS_MAP = Object.freeze({
  'northamerica-northeast1': 'Montréal',
  'northamerica-northeast2': 'Toronto',
  'us-central1': 'Iowa',
  'us-east1': 'South Carolina',
  'us-east4': 'Northern Virginia',
  'us-east5': 'Columbus',
  'us-south1': 'Dallas',
  'us-west1': 'Oregon',
  'us-west2': 'Los Angeles',
  'us-west3': 'Salt Lake City',
  'us-west4': 'Las Vegas',
  'southamerica-east1': 'São Paulo',
  'southamerica-west1': 'Santiago',
  'europe-central2': 'Warsaw',
  'europe-north1': 'Finland',
  'europe-southwest1': 'Madrid',
  'europe-west1': 'Belgium',
  'europe-west2': 'London',
  'europe-west3': 'Frankfurt',
  'europe-west4': 'Netherlands',
  'europe-west6': 'Zürich',
  'europe-west8': 'Milan',
  'europe-west9': 'Paris',
  'asia-east1': 'Taiwan',
  'asia-east2': 'Hong Kong',
  'asia-northeast1': 'Tokyo',
  'asia-northeast2': 'Osaka',
  'asia-northeast3': 'Seoul',
  'asia-south1': 'Mumbai',
  'asia-south2': 'Delhi',
  'asia-southeast1': 'Singapore',
  'asia-southeast2': 'Jakarta',
  'australia-southeast1': 'Sydney',
  'australia-southeast2': 'Melbourne',
});

/**
 * Sizes of files in each bucket and their associated file names
 * @enum {string}
 */
export const FILESIZES_NAMES = Object.freeze({
  small: '2mib.txt',
  medium: '64mib.txt',
  large: '256mib.txt',
});

/**
 * Sizes of files in each bucket and their associated size in bytes
 * @enum {number}
 */
export const FILESIZE_BYTES = Object.freeze({
  [FILESIZES_NAMES.small]: 2097152,
  [FILESIZES_NAMES.medium]: 67108864,
  [FILESIZES_NAMES.large]: 268435456,
});

/**
 * Sizes of files in each bucket and their associated size in MiB
 * @enum {number}
 */
export const FILESIZE_MIB = Object.freeze({
  [FILESIZES_NAMES.small]: 2,
  [FILESIZES_NAMES.medium]: 64,
  [FILESIZES_NAMES.large]: 256,
});

/**
 * The number of decimal places to round float values to when returning benchmark results
 * @const {number}
 */
export const FLOAT_ROUND_DIGITS = 3;

/**
 * The default time taken to return for a benchmark
 * @const {number}
 */
export const DEFAULT_TIME_TAKEN = -1;
