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
