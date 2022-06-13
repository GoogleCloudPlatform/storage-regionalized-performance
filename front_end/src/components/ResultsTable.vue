<!--
 Copyright 2022 Google LLC

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-->

<template>
  <div class="table">
    <table>
      <thead>
        <tr>
          <th>Region</th>
          <th>Location</th>
          <th>File Size</th>
          <th>Speed (MiB/s)</th>
          <th>Time Taken</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(result, index) in results" v-bind:key="index">
          <td>{{ result.bucketName }}</td>
          <td>{{ result.location }}</td>
          <td>{{ result.fileName.replaceAll(".txt", "") }}</td>
          <td>{{ result.speedMiBps }}</td>
          <td>{{ result.timeTaken }}s</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: "resultComponent",
  props: {
    results: Array,
  },
};
</script>

<style scoped>
</style>
