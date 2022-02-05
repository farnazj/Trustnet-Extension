<template>
<v-container v-show="unfollowedAssessorsVisibility" class="pa-2">
    <v-row no-gutters class="caption mb-1">
        Here are some sources who have assessed this page and who you are not yet following:
    </v-row>

    <v-row no-gutters>
        <v-col cols="4" v-for="(unfollowedAssessor, index) in unfollowedAssessorsSubset" :key="index">

            <v-row no-gutters class="mb-1 interactable" @click="showProfile(unfollowedAssessor.userName)">
                <custom-avatar :user="unfollowedAssessor" :size="25" :clickEnabled="false"
                     class="mr-1"
                ></custom-avatar>
                <span class="caption unfollowed-assessor-name">{{sourceDisplayName(unfollowedAssessor)}}</span>
            </v-row>

            <v-row no-gutters>
                <v-btn text x-small @click="followSource(unfollowedAssessor)" color="primary"
                class="caption">Follow</v-btn>
            </v-row>
            
        </v-col>

    </v-row>
</v-container>



</template>

<script>
import customAvatar from '@/components/CustomAvatar'
import sourceHelpers from '@/mixins/sourceHelpers'
import consts from '@/lib/constants'
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
        unfollowedAssessorsSubset: function() {
            return this.unfollowedAssessorsOnPage.slice(0, 3);
        },
       ...mapState('assessments', [
            'unfollowedAssessorsVisibility',
            'unfollowedAssessorsOnPage'
        ]),
  },
  methods: {
    showProfile: function(userName) {
        let newUrl = `${consts.CLIENT_URL}/profile/${userName}`;
         browser.runtime.sendMessage({
            type: 'new_tab',
            data: { 
                url: newUrl
            }
            
        })
    },
    followSource: function(source) {
        browser.runtime.sendMessage({
            type: 'follow_source',
            data: {
                reqBody: { 
                    username: source.userName
                }
            }
        })
        .then(() => {
            this.getPageAssessments({ usernames: [source.userName] });
            this.removeUserFromUnfollowedAssessors(source.id);
            this.addSourceToFollows(source);
        })
    },
    ...mapActions('assessments', [
        'getPageAssessments',
        'removeUserFromUnfollowedAssessors'
    ]),
    ...mapActions('relatedSources', [
        'addSourceToFollows'
    ])
  },
  mixins: [sourceHelpers]

}
</script>

<style scoped>

.unfollowed-assessor-name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 75%;
}

</style>