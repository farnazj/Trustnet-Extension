<template>
  <v-container fluid class="custom-sidebar pa-0">
    <custom-toolbar></custom-toolbar>
    <v-card class="pa-2">
      <v-row no-gutters>

        <p class="h4 font-weight-bold">About Reheadline</p>
        <p class="body-2">
          <span class="font-weight-bold">What does it do? </span>
          <br>
          This is a browser extension as part of a research project that helps you write better, more informative news headlines as you read news articles. <br>
          Your posted headlines can help other users who are running the extension obtain a more accurate picture of the news story and enables you to see the headlines that the others write wherever you encounter those articles, even in your Facebook or Twitter feed. This extension gives you the option to see posted headlines only from your friends or from any user of this extension.
        </p>
        <p class="body-2">
          <span class="font-weight-bold">Why do I need to sign up on a platform called Trustnet?</span>
          <br>
          This extension connects to the <a :href="sourcesLink" class="ml-1 custom-link" target="_blank">{{siteName}}
          </a> platform to manage your trust and follow relationships with other users. That is why you are asked to sign up for an account on it.
        </p>
        <p class="body-2">
           <span class="font-weight-bold">Who do I see alternative headlines from?</span>
            <br>
          When using this extension, by default, you see headlines posted only by the people you follow or trust on {{siteName}}. You can visit the Sources page on {{siteName}} to add the sources you'd like to follow or trust. Whether you follow or trust a source affects the ordering of the headlines that are presented to you.
          <br>
          However, you can also visit the Options page (by right clicking on the extension's icon on the browser and choosing Options) to select whether you'd like to keep this default or rather see headlines submitted by all the users of the extension.
        </p>  
        <p class="body-2">
           <span class="font-weight-bold">Who are we?</span>
            <br>
            The researchers involved in this project are Farnaz Jahanbakhsh @ MIT, David Karger @ MIT, Amy X. Zhang @ UW, and Karrie Karahalios @ UIUC.
        </p>
      </v-row>
    </v-card>
  </v-container>
 
 
</template>

<script>
import customToolbar from '@/components/CustomToolbar'
import consts from '@/lib/constants'

export default {
  components: {
    'custom-toolbar': customToolbar
  },
  data () {
    return {
    }
  },
  computed: {
    siteName: function() {
      return consts.SITE_NAME;
    },
    sourcesLink: function() {
      return `${consts.CLIENT_URL}/sources`;
    },
  }

}
</script>


<style scoped>
.custom-link {
    text-decoration: none;
}
</style>