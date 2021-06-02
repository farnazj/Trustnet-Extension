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
                <v-row no-gutters>{{headlineSource.text}}</v-row>
            </template>
            </v-radio>
        </v-radio-group>

        </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState, mapActions } from 'vuex'

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
          return 'ANY';
      },
      set: function(newValue) {
        this.setUserPreferences({ headlineSources: newValue });
      }
    },
    ...mapState('preferences', [
      'userPreferences'
    ])
  },
  methods: {
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
</style>
