<template>
  <v-app>
    <router-view></router-view>
  </v-app>
</template>

<script>

export default {
  name: 'popupApp',
  components: { },
  created() {
    console.log('this got created')
  }
}
</script>

<style>
html {
  width: 400px;
  height: 400px;
}
</style>
