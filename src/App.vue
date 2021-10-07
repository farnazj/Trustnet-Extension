<template>
  <v-app>
    <router-view></router-view>
    <assessments-container v-if="isLoggedIn & !isBlacklisted"></assessments-container>
  </v-app>
</template>

<script>
import assessmentsContainer from '@/components/AssessmentsContainer'
import setupHelpers from '@/mixins/setupHelpers';
import { mapState, mapGetters, mapActions } from 'vuex'

export default {
  name: 'insertedApp',
  components: {
    'assessments-container': assessmentsContainer
  },
  data: () => ({
    authUser: null
  }),
  created() {

    this.getUser()
    .then(authUser => {
      // this.logout();
      this.authUser = authUser;
      if (!authUser) {
        this.logout();
        this.$router.push({ name: 'Login' });
      }
      else {        
        this.fetchRelationships();

        this.fetchPageAndUserCharacteristics()
        .then(() => {
          //this.fetchTitlesAndRelationships();
          console.log('getting user assessments')
          if (!this.isBlacklisted) {
            this.getAllAssessments();
            this.getAuthUserPostAssessment();
          }
        })
        
      }
    });
  },
  computed: {
    ...mapGetters('auth', [
      'isLoggedIn'
    ]),
    ...mapState('pageDetails', [
      'isBlacklisted'
    ])
  },
  methods: {
    ...mapActions('auth', [
      'getUser',
      'logout'
    ]),
    ...mapActions('assessments', [
      'getAllAssessments',
      'getAuthUserPostAssessment'
    ])
  },
  mixins: [setupHelpers]
};
</script>
<style>
/* html {
   min-height: initial;
   min-width: initial;
   z-index: 9999999;
} */
</style>
