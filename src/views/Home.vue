<template>
  <div class="home">
  </div>
</template>

<script>
// @ is an alias to /src
import { mapState, mapActions } from 'vuex';

export default {
  name: 'Home',
  components: {
    
  },
  created() {

    console.log('tiltes', this.titles)
    if ( !this.titles.length && !this.titlesFetched ) {
        this.setUpTitles()
        .then( () => {
            this.setTitlesFetched(true);
        })
    }
    console.log('arrived in home')

    if (!this.followedSources.length)
        this.fetchFollows();
    if (!this.trustedSources.length)
        this.fetchTrusteds();
    
    this.fetchFollowers();
  },
  computed: {
    ...mapState('titles', [
      'titles',
      'titlesFetched'
    ]),
    ...mapState('relatedSources', [
      'followedSources',
      'trustedSources',
    ]),
  },
  methods: {
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
}
</script>
