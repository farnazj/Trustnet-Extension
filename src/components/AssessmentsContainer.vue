<template>
    <v-container fluid class="fixed-sidebar pa-0">
        <v-row no-gutters>
            <v-col cols="12">
                <v-card outlined>
                    <v-row align-center fill-height no-gutters>
                        <v-col cols="12">
                            <v-row justify="center" no-gutters>
                                <p class="pb-0 mb-0 subheading font-weight-bold">Accurate?</p>
                            </v-row>
                        </v-col>
                    </v-row>
                    <v-row no-gutters v-for="(key, index) in ['questioned', 'refuted', 'confirmed']" :key="index">
                        {{assessments[key]}}
                        <v-col cols="12" v-if="assessments[key].length">
                            <v-card-title>
                                <div>
                                    <p class="mb-1 body-2 font-weight-bold" v-if="key == 'questioned'"> Questioned</p>
                                    <p class="mb-1 body-2 font-weight-bold" v-if="key == 'confirmed'"> Yes</p>
                                    <p class="mb-1 body-2 font-weight-bold" v-else-if="key == 'refuted'"> No</p>
                                </div>
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
                    </v-row>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import innerAssessment from '@/components/InnerAssessment'
import { mapState } from 'vuex'

export default {
    components: {
        'inner-assessment': innerAssessment
    },
    data () {
        return {
            revealedSize: {}
        }
    },
    created() {
        console.log('inside assessment container');
        this.resetRevealedSize();
    },
    computed: {
        ...mapState('assessments', [
            'assessments'
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
        }
        // ...mapActions({
        //     hideContainer (dispatch, payload) {
        //         return dispatch(this.namespace + '/hideContainer', payload)
        //     }
        // })
    }
}
</script>
