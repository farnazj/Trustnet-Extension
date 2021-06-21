<template>
  <v-app>
    <router-view></router-view>
  </v-app>
</template>

<script>
import setupHelpers from '@/mixins/setupHelpers';
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'insertedApp',

  components: {
  },

  data: () => ({
  }),
  created() {
    this.getUser()
    .then(authUser => {
      // this.logout();
      if (!authUser) {
        this.logout();
        this.$router.push({ name: 'Login' });
      }
      else {
        console.log('chi shod')
        this.fetchPageAndUserCharacteristics()
        .then(() => {
          console.log('hiiiiii')
          //this.fetchTitlesAndRelationships();
          this.getAssessments();
        })
        
      }
    });
  },
  computed: {
    ...mapGetters('auth', [
      'isLoggedIn'
    ])
  },
  methods: {
    ...mapActions('auth', [
      'getUser',
      'logout'
    ]),
    ...mapActions('assessments', [
      'getAssessments'
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
