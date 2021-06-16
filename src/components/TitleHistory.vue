<template>

<v-slide-x-reverse-transition v-if="visible">
  <v-card max-width="240" max-height='50vh' class="drawer-card"> 
    <v-row no-gutters class="full-height">
      <v-col class="drawer-opener interactable" cols="1" @click="hideHistory">
        <v-row no-gutters justify="end" align="center" class="fill-height">
          <v-icon @click="hideHistory">{{icons.arrowRight}}</v-icon>
        </v-row>
      </v-col>

      <v-divider vertical></v-divider>

      <v-col cols="10"  class="pa-1">
        <v-row no-gutters justify="start">
          <p class="pb-0 mb-0 subheading font-weight-regular grey--text text--darken-3">Title History</p>
        </v-row>

        <v-divider></v-divider>

        <v-card-text>
          <v-row no-gutters justify="start" align="center">
            <custom-avatar :user="titleHistoryState.historyOwner" :clickEnabled="true" :size="25" class="mr-2">
            </custom-avatar>
             <span>{{sourceDisplayName(titleHistoryState.historyOwner)}}</span>
          </v-row>

          <template v-for="titleObj in titleHistoryState.titleHistory">
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
import { mdiMenuRight } from '@mdi/js';

export default {
  components: {
   'custom-avatar': customAvatar
  },
  data: () => {
    return {
      icons: {
        arrowRight: mdiMenuRight
      }
    }
  },
  computed: {
    visible: {
      get: function() {
        return this.titleHistoryState.historyVisibility;
      },
      set: function(newValue) {
        this.setHistoryVisibility(newValue);
      }
    },
    ...mapState('titles', [
      'titleHistoryState'
    ])
  },
  methods: {

    hideHistory: function() {
      this.setHistoryVisibility(false);
    },
    ...mapActions('titles', [
      'setHistoryVisibility'
    ])
  },
  mixins: [timeHelpers, sourceHelpers]

}
</script>

<style scoped>

.drawer-opener {
  max-width: 25px;
}

.full-height{
  height: 100%;
}

.drawer-card {
  overflow: auto;
}

</style>
