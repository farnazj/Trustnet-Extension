<template>
  <v-app>
    <router-view></router-view>
  </v-app>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  name: 'insertedApp',

  components: {
  },

  data: () => ({
    //
  }),
  created() {
    if ( !this.titles.length && !this.titlesFetched ) {
        this.setUpTitles()
        .then( () => {
            this.setTitlesFetched(true);
        })
    }
    this.getUser();
  },
  computed: {
    ...mapState('titles', [
      'titles',
      'titlesFetched'
    ])
  },
  methods: {
    ...mapActions('titles', [
      'setUpTitles',
      'setTitlesFetched'
    ]),
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
