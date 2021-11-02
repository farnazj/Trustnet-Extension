import { mapState, mapActions } from 'vuex'

export default {
  data: () => {
    return {
    }
  },
  methods: {
    fetchPageAndUserCharacteristics() {

      let thisRef = this;
    
      return Promise.all([
        this.setUpPageUrl().then(() => this.getArticleByUrl()),
        this.setUpURLObserver(),
        this.setUpObserver(),
        this.getUserPreferences(),
      ])
      .then(() => {
        thisRef.setBlackListStatus();
      })
    },

    fetchRelationships() {

      if (!this.followedSources.length)
          this.fetchFollows();
      if (!this.trustedSources.length)
          this.fetchTrusteds();

      this.fetchFollowers();
      this.fetchLists();
    },

    // fetchTitles() {

    //   if (!this.isBlackListed) {

    //       if ( !this.titles.length && !this.titlesFetched ) {
    //         this.setUpTitles()
    //         .then( () => {
    //             this.setTitlesFetched(true);
    //         })
    //       }
    //   }

    // },
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
      'setUpPageUrl',
      'setUpURLObserver',
      'getArticleByUrl',
      'setBlackListStatus'
    ]),
    ...mapActions('pageObserver', [
      'setUpObserver'
    ]),
    ...mapActions('preferences', [
      'getUserPreferences'
    ]),
    ...mapActions('sourceLists', [
      'fetchLists'
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
    ]),
    ...mapState('preferences', [
      'userPreferences'
    ]),
    ...mapState('pageDetails', [
      'url',
      'isBlacklisted'
    ])
  }

}
