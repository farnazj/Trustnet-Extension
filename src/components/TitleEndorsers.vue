<template>

<v-slide-x-reverse-transition v-if="visible">
  <v-card max-width="240">
    <v-row no-gutters class="full-height">
      <v-col class="drawer-opener" cols="1">
        <v-row no-gutters justify="end" align="center" class="fill-height">
          <v-icon @click="hideEndorsers">{{icons.arrowRight}}</v-icon>
        </v-row>
      </v-col>

      <v-divider vertical></v-divider>

      <v-col cols="10" class="pa-1">
        <v-row no-gutters justify="start">
          <p class="pb-0 mb-0 subheading font-weight-regular">Title Endorsers</p>
        </v-row>

        <v-divider></v-divider>

        <v-card-text class="pa-1">
          <template v-for="endorser in endorserUsers">
          <v-row  :key="`row-${endorser.id}`" no-gutters justify="start" align="center" class="pa-1">
            <custom-avatar :user="endorser" :clickEnabled="false" :size="25"  class="mr-2">
            </custom-avatar>
             <span>{{sourceDisplayName(endorser)}}</span>
          </v-row>
            <v-divider :key="`divider-${endorser.id}`"></v-divider>

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
        return this.titleEndorsersState.endorsersVisibility;
      },
      set: function(newValue) {
        this.setEndorsersVisibility(newValue);
      }
    },
    endorserUsers: function() {
      let endorsers = this.titles.find(title => title.id === this.titleEndorsersState.selectedStandaloneTitleId).sortedCustomTitles.find(
        customTitle => customTitle.lastVersion.setId === this.titleEndorsersState.selectedCustomTitleSetId
      ).sortedEndorsers;

      return endorsers;
    },
    ...mapState('titles', [
      'titleEndorsersState',
      'titles'
    ])
  },
  methods: {

    hideEndorsers: function() {
      this.setEndorsersVisibility(false);
    },
    ...mapActions('titles', [
      'setEndorsersVisibility'
    ])
  },
  watch: {
    titleEndorsersState: function(newVal) {
      console.log(newVal)
    }
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
</style>
