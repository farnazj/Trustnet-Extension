<template>
    
        <v-row no-gutters class="assessments-container">

            <v-btn @click="toggleAssessments" x-small :color="handleBackgroundColor" class="expand-button" height="4vh">
                <v-icon>
                    {{icons.expander}}
                </v-icon>
            </v-btn>

            <v-expand-x-transition>
                <v-container v-show="isExpanded" fluid class="assessments-pane pa-0">
                    <v-card :color="containerBackgroundColor" raised elevation="3">

                        <v-snackbar v-model="displayInfoSnackbar" top>
                            {{ infoSnackbarMessage }}
                            <v-btn color="blue lighten-1" text @click="displayInfoSnackbar = false">
                            Close
                            </v-btn>
                        </v-snackbar>

                        <v-alert v-model="errorAlert" type="error" dismissible>
                            <span class="subtitle-2">Something went wrong. Try again later. </span>
                        </v-alert>


                        <v-btn block elevation="1" plain  @click="toggleUserAssessmentDisplay">
                            Your assessment
                            <v-spacer></v-spacer>
                            <v-icon v-if="!displayUserAssessmentMenu" class="pr-1" small>{{icons.down}}</v-icon> 
                            <v-icon v-if="displayUserAssessmentMenu" class="pr-1" small>{{icons.up}}</v-icon>  
                        </v-btn>

                        <v-expand-transition>
                            <v-row no-gutters v-show="displayUserAssessmentMenu">
                                <assessment-collector @assessmentUpdateErr="showError">
                                </assessment-collector>
                            </v-row>    
                        </v-expand-transition>


                        <v-btn block elevation="1" class="mt-2" plain v-if="Object.values (userAssessment).length" @click="toggleShareDisplay">
                            Share
                            <v-spacer></v-spacer>
                            <v-icon v-if="!displayShareMenu" class="pr-1" small>{{icons.down}}</v-icon> 
                            <v-icon v-if="displayShareMenu" class="pr-1" small>{{icons.up}}</v-icon>  
                        </v-btn>

                        <v-expand-transition>
                            <v-row no-gutters v-show="displayShareMenu">
                                <v-form ref="boostMenu" lazy-validation class="boost-form">

                                <v-container fluid class="share-container py-1 px-2">
                                    
                                    <v-row no-gutters>
                                        <v-col cols="12">
                                            <source-selector ref="boostTargets" class="mt-2" population="downstream">
                                            </source-selector>
                                        </v-col>
                                    </v-row>

                                    <v-card-actions class="py-0">
                                        <v-spacer></v-spacer>
                                        <v-btn color="primary" text @click="shareArticle" small>
                                            <v-icon class="pr-1" small>{{icons.share}}</v-icon> Share
                                        </v-btn>
                                    </v-card-actions>
                                </v-container>
                                </v-form>
                            </v-row>
                        </v-expand-transition>

                        
                        <v-row align-center no-gutters v-if="isAssessmentNonEmpty" class="mt-3">
                            <v-col cols="12">
                                <v-row justify="center" no-gutters>
                                    <p class="pb-0 ma-1 subheading font-weight-bold">Accurate?</p>
                                </v-row>
                                <v-divider></v-divider>
                            </v-col>
                        </v-row>

                        <template v-if="isAssessmentNonEmpty">

                            <v-row no-gutters v-for="(key, index) in ['questioned', 'refuted', 'confirmed']" :key="index">
                                <template v-if="assessments[key].length">

                                    <v-col cols="12">
                                        <v-card-title class="pa-1">
                                            <p class="ma-1 body-2 font-weight-bold" v-if="key == 'questioned'"> Questioned</p>
                                            <p class="ma-1 body-2 font-weight-bold" v-if="key == 'confirmed'"> Yes</p>
                                            <p class="ma-1 body-2 font-weight-bold" v-else-if="key == 'refuted'"> No</p>
                                        </v-card-title>
                                        <v-divider></v-divider>

                                        <template v-for="assessment in getAssessmentsSlice(key)" >
                                            <inner-assessment :assessmentObj="assessment" 
                                            :key="assessment.lastVersion.id" :assessmentType="key"></inner-assessment>
                                        </template>

                                        <v-row no-gutters class="py-0">
                                            <span v-if="assessmentsRemaining(key)" @click="revealMore(key)"
                                            class="blue--text text--darken-3 body-2 interactable">
                                            Show More Assessments</span>
                                            <v-spacer></v-spacer>
                                            <span class="caption grey--text text--darken-3 pr-1"> {{getAssessmentStats(key)}} </span>
                                        </v-row>
                                    </v-col>

                                </template>
                            </v-row>
                        </template>
                    </v-card>
                </v-container>
            </v-expand-x-transition>
        </v-row>

</template>

<script>
import innerAssessment from '@/components/InnerAssessment'
import assessmentCollector from '@/components/AssessmentCollector'
import sourceSelector from '@/components/SourceSelector'
import constants from '@/lib/constants'
import { mapState, mapGetters, mapActions } from 'vuex'
import { mdiChevronLeft, mdiShare, mdiChevronDown, mdiChevronUp } from '@mdi/js';

export default {
    components: {
        'inner-assessment': innerAssessment,
        'assessment-collector': assessmentCollector,
        'source-selector': sourceSelector
    },
    data () {
        return {
            revealedSize: {},
            icons: {
                expander: mdiChevronLeft,
                share: mdiShare,
                down: mdiChevronDown,
                up: mdiChevronUp
            },
            errorAlert: false,
            displayInfoSnackbar: false,
            infoSnackbarMessage: '',
            displayShareMenu: false,
            displayUserAssessmentMenu: false
        }
    },
    created() {
        this.resetRevealedSize();
    },
    computed: {
        handleBackgroundColor: function() {
        
            if (Object.entries(this.userAssessment).length && this.userAssessment.postCredibility != constants.ACCURACY_CODES.QUESTIONED) {
                if (this.userAssessment.postCredibility == constants.ACCURACY_CODES.CONFIRMED)
                    return 'green darken-1';
                else if (this.userAssessment.postCredibility == constants.ACCURACY_CODES.REFUTED)
                    return 'red lighten-1';
            }
            else if (this.isConfirmed)
                return 'green darken-1';
            else if (this.isRefuted)
                return 'red lighten-1';
            else if (this.isDebated)
                return 'orange darken-1';
            else
                return 'blue-grey lighten-3';

        },
        containerBackgroundColor: function() {
            
            if (Object.entries(this.userAssessment).length && this.userAssessment.postCredibility != constants.ACCURACY_CODES.QUESTIONED) {
                if (this.userAssessment.postCredibility == constants.ACCURACY_CODES.CONFIRMED)
                    return 'green lighten-5';
                else if (this.userAssessment.postCredibility == constants.ACCURACY_CODES.REFUTED)
                    return 'red lighten-5';
            }
            else if (this.isConfirmed)
                return 'green lighten-5';
            else if (this.isRefuted)
                return 'red lighten-5';
            else if (this.isDebated)
                return 'orange lighten-5';
            else
                return 'blue-grey lighten-5';
        },
        isAssessmentNonEmpty: function() {
            return Object.values(this.assessments).flat().length;
        },
        disableBoost: function() {
            return !Object.values(this.userAssessment).length;
        },
        ...mapState('assessments', [
            'assessments',
            'isExpanded',
            'userAssessment'
        ]),
        ...mapState('pageDetails', [
            'articleId'
        ]),
        ...mapGetters('assessments', [
            'isConfirmed',
            'isRefuted',
            'isDebated'
        ])
    },
    methods: {
        resetRevealedSize: function() {
            this.revealedSize = {'questioned': 4, 'confirmed': 5, 'refuted': 5};
        },
        revealMore: function(key) {
            this.revealedSize[key] += 5;
        },
        getAssessmentsSlice: function(key) {
            return this.assessments[key].slice(0, this.revealedSize[key]);
        },
        getAssessmentStats: function(key) {
            return this.getAssessmentsSlice(key).length + ' of ' + this.assessments[key].length;
        },
        assessmentsRemaining: function(key) {
            return this.getAssessmentsSlice(key).length < this.assessments[key].length;
        },
        toggleAssessments: function() {
            if (this.isExpanded)
                this.setVisibility(false);
            else
                this.setVisibility(true);
        },
        getSelectedUsernamesAndLists: function() {

            let lists = this.$refs.boostTargets.targets.filter(el =>
                el.type === 'List').map(el => el.identifier);
            let usernames = this.$refs.boostTargets.targets.filter(el =>
                el.type === 'Source').map(el => el.identifier);

            return { usernames: usernames, lists: lists };
        },
        shareArticle: function() {

            if (this.$refs.boostMenu.validate()) {

                let targets = this.getSelectedUsernamesAndLists();
                let reqBody = {
                    post_id: this.articleId,
                    target_usernames: targets.usernames,
                    target_lists: targets.lists
                };

                this.boostArticle(reqBody)
                .then(response => {
                    if (response.status != 200)
                        this.errorAlert = true;
                    else {
                        // this.updateStateArticle({ postId: this.articleId })
                        this.infoSnackbarMessage = `Article shared to Trustnet: ${response.data.data}`;
                        this.displayInfoSnackbar = true;
                    }
                })
            }
        },

        toggleShareDisplay: function() {
            this.displayShareMenu = !this.displayShareMenu;
        },

        toggleUserAssessmentDisplay: function() {
            this.displayUserAssessmentMenu = !this.displayUserAssessmentMenu
        },

        showError: function(err) {
            this.errorAlert = true;
        },
        ...mapActions('assessments', [
            'setVisibility'
        ]),
        ...mapActions('boosts', [
            'boostArticle'
        ])
    }
}
</script>

<style scoped>
.expand-button {
    height: 10%;
}

.share-container {
    border: 1px  #90A4AE solid;
    border-top: initial;
}

.boost-form {
    width: 100%;
}
</style>