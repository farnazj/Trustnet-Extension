<template>
  <v-app>
    <router-view></router-view>
  </v-app>
</template>

<script>
import { mapState, mapActions } from 'vuex'

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
      else {
        this.fetchTitlesAndRelationships();
      }
    });
  },
  computed: {
    ...mapState('titles', [
      'titles',
      'titlesFetched'
    ]),
    ...mapState('relatedSources', [
      'followedSources',
      'trustedSources',
    ])

  },
  methods: {
    fetchTitlesAndRelationships() {

      if (!this.followedSources.length)
          this.fetchFollows();
      if (!this.trustedSources.length)
          this.fetchTrusteds();
      
      this.fetchFollowers();

      if ( !this.titles.length && !this.titlesFetched ) {
          this.setUpTitles()
          .then( () => {
              this.setTitlesFetched(true);
          })
      }
    },
    ...mapActions('auth', [
      'getUser'
    ]),
    ...mapActions('titles', [
      'setUpTitles',
      'setTitlesFetched'
    ]),
    ...mapActions('relatedSources', [
      'fetchFollows',
      'fetchTrusteds',
      'fetchFollowers'
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
