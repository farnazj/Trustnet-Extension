import { mapState, mapActions } from 'vuex'

export default {
  data: () => {
    return {
    }
  },
  methods: {
    fetchTitlesAndRelationships() {

      this.setUpPageUrl();
      this.setUpObserver();

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
    ...mapActions('titles', [
      'setUpTitles',
      'setTitlesFetched'
    ]),
    ...mapActions('relatedSources', [
      'fetchFollows',
      'fetchTrusteds',
      'fetchFollowers'
    ]),
    ...mapActions('pageDetails', [
      'setUpPageUrl'
    ]),
    ...mapActions('pageObserver', [
        'setUpObserver'
    ])
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
  }

}
