<template>
  <v-container fluid class="fixed-sidebar login-style pa-0">
    <custom-toolbar></custom-toolbar>
    <v-card class="pa-2">
      <v-row no-gutters>

        <p class="h4 font-weight-bold">About {{siteName}}</p>
        <p class="body-2">
          <span class="font-weight-bold">What does it do? </span>
          <br>
          This is a browser extension as part of a research project that allows you to assess different articles as accurate or inaccurate. Your assessments can help benefit those users who follow or trust you on <a :href="sourcesLink" class="ml-1 custom-link" target="_blank">{{siteName}}
          </a>. You too can benefit from the assessments provided by your sources, since their assessments of any webpage you visit will be loaded on the page.
          <br>
          In addition to providing accuracy assessments, you can also inquire about the accuracy of an article. Your inquiries can be anonymous or tied to your name and by default, will surface to those you have marked as trustworthy on {{siteName}}. Alternatively, you can specify who you would like to ask about the accuracy of the content.
        </p>
        <p class="body-2">
          <span class="font-weight-bold">Why do I need to sign up on a platform called Trustnet?</span>
          <br>
          This extension connects to the <a :href="sourcesLink" class="ml-1 custom-link" target="_blank">{{siteName}}
          </a> platform to manage your trust and follow relationships with other users. By visiting {{siteName}} you can view a feed of the posts that the sources you follow have shared. You can also modify the list of sources you follow or trust by visiting the Sources page on {{siteName}}.
        </p>
        <!-- <p class="body-2">
           <span class="font-weight-bold">Who do I see alternative headlines from?</span>
            <br>
          When using this extension, by default, you see headlines posted only by the people you follow or trust on {{siteName}}. You can visit the Sources page on {{siteName}} to add the sources you'd like to follow or trust. Whether you follow or trust a source affects the ordering of the headlines that are presented to you.
          <br>
          However, you can also visit the Options page (by right clicking on the extension's icon on the browser and choosing Options) to select whether you'd like to keep this default or rather see headlines submitted by all the users of the extension.
        </p>   -->
        <p class="body-2">
           <span class="font-weight-bold">Who are we?</span>
            <br>
            The researchers involved in this project are Farnaz Jahanbakhsh @ MIT, Amy X. Zhang @ UW, and David Karger @ MIT.
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
      return `${consts.CLIENT_URL}`;
    },
  }

}
</script>


<style scoped>
.custom-link {
    text-decoration: none;
}
</style>