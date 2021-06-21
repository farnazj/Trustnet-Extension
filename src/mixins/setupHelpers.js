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
        this.setUpPageUrl(),
        this.setUpObserver(),
        this.getUserPreferences()
      ]);
    },

    fetchTitlesAndRelationships() {

      if (!this.followedSources.length)
          this.fetchFollows();
      if (!this.trustedSources.length)
          this.fetchTrusteds();

      console.log('user preferences:', this.userPreferences);

      let pageHostname = utils.extractHostname(this.url);
      let pageIsBlackListed = false;

      if ('blackListedWebsites' in this.userPreferences) {
        pageIsBlackListed = this.userPreferences.blackListedWebsites.some(blacklistedWebsite => 
          pageHostname.includes(blacklistedWebsite)
        )
      }
      console.info('is page blacklisted:', pageIsBlackListed)

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
      'setUpPageUrl'
    ]),
    ...mapActions('pageObserver', [
        'setUpObserver'
    ]),
    ...mapActions('preferences', [
      'getUserPreferences'
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
