<template>
  <v-app>
    <router-view></router-view>
    <assessments-container v-if="isLoggedIn"></assessments-container>
  </v-app>
</template>

<script>
import assessmentsContainer from '@/components/AssessmentsContainer'
import setupHelpers from '@/mixins/setupHelpers';
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'insertedApp',
  components: {
    'assessments-container': assessmentsContainer
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
        this.fetchRelationships();

        this.fetchPageAndUserCharacteristics()
        .then(() => {
          //this.fetchTitlesAndRelationships();
          this.getAllAssessments();
          this.getAuthUserPostAssessment();
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
