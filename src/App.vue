<template>
  <v-app>
    <router-view></router-view>
  </v-app>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'insertedApp',

  components: {
  },

  data: () => ({
    //
  }),
  created() {
    this.getUser()
    .then(authUser => {
      if (!authUser) {
        this.$router.push({ name: 'Login' });
      }
    });
  },
  computed: {
  },
  methods: {
    ...mapActions('auth', [
      'getUser'
    ])
  }
};
</script>
<style>
html {
   min-height: initial;
   min-width: initial;
   z-index: 9999999;
}
</style>
