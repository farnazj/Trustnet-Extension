<template>

<v-slide-x-reverse-transition v-if="visible">
  <v-card max-width="270">
    <v-row no-gutters >
      <v-col class="drawer-opener" cols="1">
        <v-row no-gutters justify="end" align="center" class="fill-height">
          <v-icon @click="hideHistory">arrow_right</v-icon>
        </v-row>
      </v-col>

      <v-divider vertical></v-divider>

      <v-col cols="10"  class="pa-1">
        <v-row no-gutters justify="start">
          <p class="pb-0 mb-0 subheading font-weight-regular">Title History</p>
        </v-row>

        <v-divider></v-divider>

        <v-card-text>
          <v-row no-gutters justify="start" align="center">
            <custom-avatar :user="historyOwner" :clickEnabled="true" class="mr-2">
            </custom-avatar>
             <span>{{sourceDisplayName(historyOwner)}}</span>
          </v-row>

          <template v-for="titleObj in titleHistory">
            <v-row no-gutters :key="`row-${titleObj.id}`" align="center" class="py-1">
             <v-col cols="12">
               <p class="grey--text text--darken-3 mb-1">
                 {{titleObj.text}}
               </p>
               <span class="caption grey--text text--darken-2">{{timeElapsed(titleObj.createdAt)}}</span>
               <span v-if="titleObj.userEndorsed" class="ml-2 font-weight-light caption grey--text text--darken-1">
                 user endorsed
               </span>
             </v-col>
           </v-row>
           <v-divider :key="`divider-${titleObj.id}`"></v-divider>

          </template>

        </v-card-text>

      </v-col>

    </v-row>
  </v-card>
</v-slide-x-reverse-transition>

</template>

<script>
import customAvatar from '@/components/CustomAvatar'
import timeHelpers from '@/mixins/timeHelpers'
import sourceHelpers from '@/mixins/sourceHelpers'
import { mapState, mapActions } from 'vuex'

export default {
  components: {
   'custom-avatar': customAvatar
  },
  data: () => {
    return {
    }
  },
  computed: {
    visible: {
      get: function() {
        return this.historyVisiblity;
      },
      set: function(newValue) {
        this.setHistoryVisibility(newValue);
      }
    },
    ...mapState('titles', [
      'titleHistory',
      'historyVisibility',
      'historyOwner'
    ])
  },
  methods: {

    hideHistory: function() {
      this.setHistoryVisibility(false);
    },
    ...mapActions('titles', [
      'setHistoryVisiblity'
    ])
  },
  mixins: [timeHelpers, sourceHelpers]

}
</script>

<style scoped>

.drawer-opener {
  max-width: 25px;
}

</style>
