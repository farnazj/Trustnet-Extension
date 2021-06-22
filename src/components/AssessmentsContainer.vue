<template>
    
        <v-row no-gutters class="assessments-container">

            <v-btn @click="toggleAssessments" x-small color="blue-grey lighten-3" class="expand-button" height="4vh">
                <v-icon>
                    {{icons.expander}}
                </v-icon>
            </v-btn>

            <v-expand-x-transition>
                <v-container v-show="isExpanded" fluid class="assessments-pane pa-0">
                    <v-card color="blue-grey lighten-5" raised elevation="3">
                        <v-row no-gutters>
                            <v-col cols="12">
                                
                                <v-row align-center no-gutters v-if="isAssessmentNonEmpty">
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

                                                <v-row no-gutters class="pa-1">
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

                            </v-col>
                        </v-row>
                    </v-card>
                </v-container>
            </v-expand-x-transition>
        </v-row>

</template>

<script>
import innerAssessment from '@/components/InnerAssessment'
import { mapState, mapActions } from 'vuex'
import { mdiChevronLeft } from '@mdi/js';

export default {
    components: {
        'inner-assessment': innerAssessment
    },
    data () {
        return {
            revealedSize: {},
            icons: {
                expander: mdiChevronLeft
            }
        }
    },
    created() {
        this.resetRevealedSize();
    },
    computed: {
        isAssessmentNonEmpty: function() {
            return Object.values(this.assessments).flat().length;
        },
        ...mapState('assessments', [
            'assessments',
            'isExpanded'
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
        ...mapActions('assessments', [
            'setVisibility'
        ])
        // ...mapActions({
        //     hideContainer (dispatch, payload) {
        //         return dispatch(this.namespace + '/hideContainer', payload)
        //     }
        // })
    }
}
</script>

<style scoped>
.expand-button {
    height: 10%;
}
</style>