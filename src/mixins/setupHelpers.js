import { mapState, mapActions } from 'vuex'
import utils from '@/services/utils'

export default {
  data: () => {
    return {
    }
  },
  methods: {

    fetchPageAndUserCharacteristics() {
    
      return Promise.all([
        this.setUpPageUrl().then(() => this.getArticleByUrl()),
        this.setUpObserver(),
        this.getUserPreferences(),
      ]);
    },

    fetchRelationships() {

      if (!this.followedSources.length)
          this.fetchFollows();
      if (!this.trustedSources.length)
          this.fetchTrusteds();

      this.fetchFollowers();
      this.fetchLists();
    },

    fetchTitles() {

      let pageHostname = utils.extractHostname(this.url);
      let pageIsBlackListed = false;

      if ('blackListedWebsites' in this.userPreferences) {
        pageIsBlackListed = this.userPreferences.blackListedWebsites.some(blacklistedWebsite => 
          pageHostname.includes(blacklistedWebsite)
        )
      }

      if (!pageIsBlackListed) {

          if ( !this.titles.length && !this.titlesFetched ) {
            this.setUpTitles()
            .then( () => {
                this.setTitlesFetched(true);
            })
          }
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
      'setUpPageUrl',
      'getArticleByUrl'
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
      'url'
    ])
  }

}
