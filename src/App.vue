<template>
  <v-app>
    <router-view></router-view>
  </v-app>
</template>

<script>
import setupHelpers from '@/mixins/setupHelpers';
import {  mapActions } from 'vuex'

export default {
  name: 'insertedApp',

  components: {
  },

  data: () => ({
  }),
  created() {
    this.getUser()
    .then(authUser => {
      if (!authUser) {
        this.$router.push({ name: 'Login' });
      }
      else {
        this.fetchTitlesAndRelationships();
      }
    });
  },
  methods: {
    ...mapActions('auth', [
      'getUser'
    ])
  },
  mixins: [setupHelpers]
};
</script>
<style>
html {
   min-height: initial;
   min-width: initial;
   z-index: 9999999;
}
</style>
