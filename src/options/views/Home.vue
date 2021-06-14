<template>
  <v-container>
    <v-row no-gutters justify="center" class="pt-5">
        <v-col cols="10" sm="6" md="4" lg="3">

        <v-radio-group v-model="selectedHeadlineSource">
            <template v-slot:label>
                <div>I'd like to see alternative headlines from:</div>
            </template>
            <v-radio v-for="(headlineSource, index) in headlineSourceItems" :key="index"
            :value="headlineSource.value" >
                <template v-slot:label>
                    <v-row no-gutters class="my-0 caption">{{headlineSource.text}}</v-row>
                </template>
            </v-radio>
        </v-radio-group>

        <v-row class="mt-1" no-gutters>
            <p class="body-2">To change the sources you follow or trust you can visit the Sources page on
                <a :href="sourcesLink" class="ml-1 custom-link" target="_blank">{{siteName}}
                </a>.
            </p>
        </v-row>

        <v-divider></v-divider>

        <v-row no-gutters class="mt-6">
            <v-combobox v-model="blackListedWebsites" small-chips dense :hide-no-data="true"
                label="Disable the extension on certain domains" multiple persistent-hint
                hint="e.g., google.com or www.google.com"
            >
            <template v-slot:selection="{ attrs, item, select, selected }">
                <v-chip v-bind="attrs"
                    :input-value="selected" close 
                    @click:close="removeWebsite(item)"
                >
                {{ item }}
                </v-chip>
            </template>   
        </v-combobox>
        </v-row>

        </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import consts from '@/lib/constants'
import utils from '@/services/utils'

export default {
  name: 'optionsApp',
  created() {
    this.getUserPreferences();
    console.log('user prefs', this.userPreferences)
  },
  data () {
    return {
      headlineSourceItems: [{
        text: 'The sources I follow or trust.',
        value: 'FOLLOWED_TRUSTED'
      }, {
        text: 'Any source.',
        value: 'ANY'
      }]
    }
  },
  computed: {
    selectedHeadlineSource: {
      get: function() {
        if (typeof this.userPreferences.headlineSources === 'undefined')
          return 'FOLLOWED_TRUSTED';
        else
          return this.userPreferences.headlineSources;
      },
      set: function(newValue) {
        this.setUserPreferences({ headlineSources: newValue });
      }
    },
    blackListedWebsites: {
        get: function() {
            if ('blackListedWebsites' in this.userPreferences)
                return this.userPreferences.blackListedWebsites;
            else
                return [];
        },
        set: function(newVals) {
            let sanitizedVals = newVals.map(domain => {
                return utils.extractHostname(domain);
            })
            console.log('sanitized vals', sanitizedVals);
            this.setUserPreferences({ blackListedWebsites: sanitizedVals });
        }
    },
    siteName: function() {
        return consts.SITE_NAME;
    },
    sourcesLink: function() {
        return `${consts.CLIENT_URL}/sources`;
    },
    ...mapState('preferences', [
      'userPreferences'
    ])
  },
  methods: {
    removeWebsite: function(item) {
        const index = this.blackListedWebsites.indexOf(item);
        if (index > -1) {
            this.blackListedWebsites.splice(index, 1);
            this.setUserPreferences({ blackListedWebsites: this.blackListedWebsites });
        }
    },
    ...mapActions('preferences', [
      'getUserPreferences',
      'setUserPreferences'
    ])
  }
}
</script>

<style>
html {
  width: 400px;
  height: 400px;
}

.custom-link {
    text-decoration: none;
}
</style>
