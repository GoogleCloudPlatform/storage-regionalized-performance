<template>
  <div>
    <header>
      <h1>{{ title }}</h1>
    
    <button class="btn" @click="onClick">About <i class="fa fa-question-circle" aria-hidden="true"/></button>
    </header>
    <h3 class="subtitle">{{ subtitle }}</h3>
  </div>
</template>

<script>
export default {
  name: "SiteHeader",
  props: ["title", "subtitle"],
  methods: {
      onClick(){
          console.log("About Page Button Clicked")
      }
  }
};
</script>

<style scoped>
div {
    padding: 10px 30px ;

}
i {
    padding-left: 10px;
    font-size: larger;
}
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #1a73e8;
}
.fileSizes {
  display: flex;
  justify-content: right;
  align-items: center;
}
</style>