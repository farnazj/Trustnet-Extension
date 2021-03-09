<template>
  <div >
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';

export default {
  created() {
    browser.tabs.query({ active: true, currentWindow: true })
    .then( tabs => {
        browser.tabs.sendMessage(tabs[0].id, { type: 'close_sidebar' });
        browser.tabs.sendMessage(tabs[0].id, { type: 'inject_inpage_vue_app' });
    })

    if (!this.followedSources.length)
        this.fetchFollows();
    if (!this.trustedSources.length)
        this.fetchTrusteds();
    
    this.fetchFollowers();
  }, 
  computed: {
    ...mapState('relatedSources', [
        'followedSources',
        'trustedSources',
    ]),
    ...mapGetters('relatedSources', [
        'followedOrTrusteds',
        'trustedIds',
        'followedIds'
    ])
  },
  methods: {
    ...mapActions('relatedSources', [
      'fetchFollows',
      'fetchTrusteds',
      'fetchFollowers'
    ])
  }
}
</script>