<template>
<!-- Progress Bar: https://css-tricks.com/css3-progress-bars/ -->
    <div class="progbar">
      <span :style="{width: progressWidth}"/>
    </div>
</template>

<script>
export default {
    name: "ProgressBarComponent",
    props: {
        progressWidth: String
    }
}
</script>

<style scoped>
.progbar {
  height: 10px;
  position: relative;
  background-color: rgb(89, 101, 128);
  border-radius: 3px;
}
.progbar > span {
  display: block;
  height: 100%;
  max-width: 100%;
  background-color: hsl(214, 100%, 65%);
  position: relative;
  border-radius: 3px;
  overflow: hidden;
}

</style>