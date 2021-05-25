<template>
<v-dialog v-model="dialogVisible" max-width="530px">
     <!-- <v-slide-x-reverse-transition> -->
    <v-snackbar v-model="alert" top>
        {{ alertMessage }}
        <v-btn color="blue lighten-1" text @click="snackbar = false">
            Close
        </v-btn>
    </v-snackbar>

    <delete-dialog itemType="title" :showDialog="showDeleteDialog"
    @close="cancelDelete" @confirm="proceedDelete">
    </delete-dialog>


    <v-row no-gutters>
        <v-col>

            <v-slide-x-reverse-transition>

                <v-card  class="pa-1 custom-titles-container-card" max-width="100%" max-height="50vh">
                    <v-row no-gutters align="center">
                        <v-col cols="11">
                        <v-row no-gutters justify="start">
                            <p class="pb-0 mb-0 subheading font-weight-regular">Alternative Headline</p>
                        </v-row>
                        </v-col>
                        <v-col cols="1">
                        <v-row no-gutters justify="end">
                            <v-icon @click="returnToHome">{{icons.clear}}</v-icon>
                        </v-row>
                        </v-col>
                    </v-row>

                    <v-divider class="my-1"></v-divider>

                    <v-row no-gutters class="pa-1">
                        <v-col cols="12">
                        <v-form ref="newTitleForm" lazy-validation>
                            <v-text-field v-model="newTitle" label="Suggest alternative headline"
                            required :rules="formsRules.newTitleRules">
                            </v-text-field>
                        </v-form>
                        </v-col>
                    </v-row>

                    <v-card-text class="pa-1">

                        <v-row no-gutters justify="end">
                            <v-card-actions >
                            <v-btn :disabled="postBtnDisabled" outlined small color="primary" @click="postNewTitle">Submit</v-btn>
                            </v-card-actions>
                        </v-row>

                        <v-divider v-if="associatedStandaloneTitle && 
                            associatedStandaloneTitle.sortedCustomTitles.length"></v-divider>
                        
                        <v-row no-gutters v-if="associatedStandaloneTitle">
                            <v-col cols="12">

                                <template v-for="(titleObj, index) in associatedStandaloneTitle.sortedCustomTitles">
                                    <v-row no-gutters align="center" class="py-1" :key="`meta-info-${index}`">
                                        <custom-avatar :user="titleObj.author" :clickEnabled="true"></custom-avatar>
                                        <span class="ml-2 caption grey--text text--darken-3"> {{timeElapsed(titleObj.lastVersion.createdAt)}} </span>
                                        <span v-if="titleObj.history.length" class="ml-2 caption grey--text text--darken-1 interactable"
                                            @click.stop="showHistory(titleObj)">Edited</span>
                                    </v-row>

                                    <v-row no-gutters class="mt-1" :key="`title-text-${index}`">
                                        <v-col cols="12">
                                        <v-form ref="editTitleForm" lazy-validation>
                                            <div v-if="titleObj.author.id == user.id && edit.on && edit.setId == titleObj.lastVersion.setId">
                                            <v-text-field v-model="edit.text" background-color="blue lighten-5"
                                            required :rules="formsRules.titleEditRules">
                                            </v-text-field>
                                            </div>
                                        <div v-else>
                                            <p class="grey--text text--darken-3 mb-1">{{titleObj.lastVersion.text}}</p>
                                        </div>
                                        </v-form>
                                        </v-col>
                                    </v-row>

                                    <v-row no-gutters class="mt-1 mb-1" :key="`title-actions-${index}`">
                                        <v-col cols="1">
                                            <v-icon @click="changeEndorsement(titleObj, index, false)"
                                            v-if="titleObj.userEndorsed" color="primary" small class="xs-icon-font interactable">
                                                {{icons.thumbUpFilled}}
                                            </v-icon>
                                            <v-icon @click="changeEndorsement(titleObj, index, true)" v-else
                                            color="primary" small class="xs-icon-font interactable">
                                                {{icons.thumbUpOutline}}
                                            </v-icon>
                                        </v-col>

                                        <v-col cols="5">
                                            <v-row no-gutters v-if="titleObj.sortedEndorsers.length" @click.stop="showEndorsers(titleObj)" class="interactable">
                                                <template v-for="(endorser, endorserIndex) in titleObj.sortedEndorsers.slice(0, endorsersOnCard)">
                                                    <custom-avatar :user="endorser" :size="25" :clickEnabled="true" :key="`endorser-${endorserIndex}`"
                                                    class="mr-2"></custom-avatar>
                                                </template>
                                                <span v-if="titleObj.sortedEndorsers.length > endorsersOnCard" 
                                                    :class="{'mr-2': $vuetify.breakpoint.smAndDown}" >...</span>
                                            </v-row>
                                        </v-col>

                                        <v-col cols="6" v-if="titleObj.author.id == user.id">

                                            <v-row justify="end" no-gutters>
                                                <v-tooltip bottom :open-on-hover="true" open-delay="500">
                                                    <template v-slot:activator="{ on }">
                                                        <v-btn v-show="!edit.on || edit.setId != titleObj.lastVersion.setId" x-small outlined
                                                        @click="startEdit(titleObj)" v-on="on" color="green lighten-1" class="mr-2">
                                                        <v-icon small>{{icons.edit}}</v-icon>
                                                        </v-btn>
                                                    </template>
                                                    <span>Edit</span>
                                                </v-tooltip>

                                                <v-tooltip bottom :open-on-hover="true" open-delay="500">
                                                    <template v-slot:activator="{ on }">
                                                        <v-btn v-show="edit.on && edit.setId == titleObj.lastVersion.setId" x-small outlined
                                                        @click="resetEdits" v-on="on" color="red lighten-1" class="mr-1">
                                                        <v-icon small>{{icons.cancel}}</v-icon>
                                                        </v-btn>
                                                    </template>
                                                    <span>Cancel edit</span>
                                                </v-tooltip>

                                                <v-tooltip bottom :open-on-hover="true" open-delay="500">
                                                    <template v-slot:activator="{ on }">
                                                        <v-btn v-show="edit.on && edit.setId == titleObj.lastVersion.setId" x-small outlined
                                                        @click="saveEdits" v-on="on" color="green lighten-1" class="mr-3">
                                                        <v-icon small class="xs-icon-font">{{icons.check}}</v-icon>
                                                        </v-btn>
                                                    </template>
                                                    <span>Save edit</span>
                                                </v-tooltip>

                                                <v-tooltip bottom :open-on-hover="true" open-delay="500">
                                                    <template v-slot:activator="{ on }">
                                                        <v-btn x-small outlined @click="startDelete(titleObj)" v-on="on"
                                                        color="red lighten-1">
                                                        <v-icon small class="xs-icon-font">{{icons.delete}}</v-icon>
                                                        </v-btn>
                                                    </template>
                                                    <span>Delete</span>
                                                </v-tooltip>

                                            </v-row>
                                        </v-col>
                                    </v-row>  

                                    <v-divider :key="`title-divider-${index}`"></v-divider>
                                </template>
                            </v-col>
                        </v-row>

                    </v-card-text>
                </v-card>
            </v-slide-x-reverse-transition>
        </v-col>
    
        <title-endorsers ></title-endorsers>
        <title-history></title-history>
    </v-row>

    </v-dialog>
</template>

<script>
import customAvatar from '@/components/CustomAvatar'
import deleteConfirmationDialog from '@/components/DeleteConfirmationDialog'
import titleHistory from '@/components/TitleHistory'
import titleEndorsers from '@/components/TitleEndorsers'
import timeHelpers from '@/mixins/timeHelpers'
// import titleServices from '@/services/titleServices'
import { mapState, mapGetters, mapActions } from 'vuex'
import { mdiWindowClose, mdiPencil, mdiTrashCanOutline, mdiCheck,
    mdiCloseCircleOutline, mdiThumbUpOutline, mdiThumbUp } from '@mdi/js';

export default {
    components: {
        'custom-avatar': customAvatar,
        'delete-dialog': deleteConfirmationDialog,
        'title-history': titleHistory,
        'title-endorsers': titleEndorsers
    },
   data: () => {
       return {
            newTitle: '',
            postBtnDisabled: false,
            edit: {
                on: false,
                setId: null,
                text: ''
            },
            showDeleteDialog: false,
            delete: {
                selectedTitle: null
            },
            formsRules: {
                newTitleRules: [
                    v => !!v || 'Forgot to write the title?'
                ],
                titleEditRules: [
                    v => !!v || 'Forgot to write the title?'
                ]
            },
            alert: false,
            alertMessage: '',
            icons: {
                clear: mdiWindowClose,
                edit: mdiPencil,
                delete: mdiTrashCanOutline,
                check: mdiCheck,
                cancel: mdiCloseCircleOutline,
                thumbUpOutline: mdiThumbUpOutline,
                thumbUpFilled: mdiThumbUp
            }
            
        }
    },
    
    created() {
        console.log('in custom titles created', this.user)
    },
    // beforeRouteLeave (to, from, next) {
    //     this.hideContainer();
    //     next();
    // },
    computed: {

        dialogVisible: {
            get: function() {
                return this.titlesDialogVisible;
            },
            set: function(newValue) {
                this.returnToHome();
            }
        },
        associatedStandaloneTitle: function() {

            if (this.displayedTitle.titleId){
                console.log('standalone title is ', this.titles.find(title => title.id == this.displayedTitle.titleId))
                return this.titles.find(title => title.id == this.displayedTitle.titleId);
            }
            else
                return null;
        },
        endorsersOnCard: function() {
            if (this.$vuetify.breakpoint.smAndDown)
                return 1;
            else if (this.$vuetify.breakpoint.mdAndDown)
                return 2;
            else 
                return 3;
        },
        ...mapGetters('auth', [
            'user'
        ]),
        ...mapState('titles', [
            'titles',
            'titlesDialogVisible',
            'displayedTitle'
        ]),
        ...mapState('pageDetails', [
            'url'
        ])
    },
    methods: {
        returnToHome: function() {
   
            this.setTitlesDialogVisibility(false);
            this.$router.push({ name: 'home' });
            
        },
        postNewTitle: function() {
            if (this.$refs.newTitleForm.validate()) {
                this.postBtnDisabled = true;

                let pageIndentifiedTitle = this.displayedTitle.titleId && this.associatedStandaloneTitle ? 
                    this.associatedStandaloneTitle.text : this.displayedTitle.titleText;

                let thisRef = this;
                
                browser.runtime.sendMessage({
                    type: 'post_new_title',
                    data: {
                        reqBody: {
                            postId: this.associatedStandaloneTitle ? this.associatedStandaloneTitle.PostId : null,
                            postUrl: this.url,
                            customTitleText: this.newTitle,
                            pageIndentifiedTitle: pageIndentifiedTitle
                        }
                    }
                })
                .then(res => {
                    console.log('got response back', res)
                    thisRef.newTitle = '';
                    thisRef.$refs.newTitleForm.resetValidation();
                    thisRef.addTitleToPage({
                        hash: res.data.data.hash,
                        titleElementId: thisRef.displayedTitle.titleElementId
                    })
                    .then(() => {
                        thisRef.setDisplayedTitle({ 
                            titleId: res.data.data.id,
                            titleText: res.data.data.text
                        })
                    })
                })
                .catch(err => {
                    console.log(err)
                    thisRef.alertMessage = err.response.data.message;
                    thisRef.alert = true;
                })
                .finally(() => {
                    thisRef.postBtnDisabled = false;
                })
            
            }
        },
    changeEndorsement: function(titleObj, arrIndex, endorsementVal) {

        browser.runtime.sendMessage({
            type: 'set_endorsement_status',
            data: {
                params: {
                    setId: titleObj.lastVersion.setId
                },
                reqBody: {
                    endorse_status: endorsementVal
                }
            }
        })
        .then(() => {
            browser.runtime.sendMessage({
                type: 'has_user_endorsed_title',
                data: {
                    params: {
                        setId: titleObj.lastVersion.setId
                    }
                }
            })
            .then(res => {
              titleObj['userEndorsed'] = res.data;
            })
        })
    },
    startDelete: function(titleObj) {
      this.delete.selectedTitle = titleObj;
      this.showDeleteDialog = true;
    },
    cancelDelete: function() {
      this.delete.selectedTitle = null;
      this.showDeleteDialog = false;
    },
    proceedDelete: function() {

        this.showDeleteDialog = false;

        if (this.edit && this.delete.selectedTitle.lastVersion.setId == this.edit.setId) {
            let index = this.associatedStandaloneTitle.sortedCustomTitles.findIndex(customTitle => 
                customTitle.lastVersion.setId == this.edit.setId);
            this.$refs.editTitleForm[index].resetValidation();
            this.resetEdits();
        }

        browser.runtime.sendMessage({
            type: 'delete_title',
            data: {
                reqBody: {
                    standaloneTitleId: this.associatedStandaloneTitle.id,
                    setId: this.delete.selectedTitle.lastVersion.setId
                }
            }
        })
        .then(res => {
            this.delete.selectedTitle = null;
            this.modifyCustomTitleInPage({
                standaloneTitleId: this.associatedStandaloneTitle.id
            })
        })
        .catch(err => {
            this.alertMessage = err.response.data.message;
            this.alert = true;
        })

    },
    startEdit: function(title) {

      this.edit.on = true;
      this.edit.setId = title.lastVersion.setId;
      this.edit.text = title.lastVersion.text;
    },
    saveEdits: function() {

        let index = this.associatedStandaloneTitle.sortedCustomTitles.findIndex(customTitle => 
            customTitle.lastVersion.setId == this.edit.setId);

        if (this.$refs.editTitleForm[index].validate()) {

            browser.runtime.sendMessage({
                type: 'edit_title',
                data: {
                    reqParams: {
                        standaloneTitleId: this.associatedStandaloneTitle.id,
                        setId: this.edit.setId
                    },
                    reqBody: {
                        text: this.edit.text 
                    }
                }
            })
            .then(res => {
                this.resetEdits();
                this.$refs.editTitleForm[index].resetValidation();
                this.modifyCustomTitleInPage({
                    standaloneTitleId: this.associatedStandaloneTitle.id
                })
            })
            .catch(err => {
                console.log(err)
                this.alertMessage = err.response.data.message;
                this.alert = true;
            })
      
        }

    },
    resetEdits: function() {

      this.edit.on = false;
      this.edit.setId = null;
      this.edit.text = '';
    },
    showHistory: function(titleObj) {

        this.setEndorsersVisibility(false);
        this.populateTitleHistory({
            titleHistory: titleObj.history,
            historyOwner: titleObj.author
        });
        this.setHistoryVisibility(true);
    },
    showEndorsers: function(titleObj) {

        this.setHistoryVisibility(false);
        this.setEndorsersTitleIds({
            selectedStandaloneTitleId: titleObj.lastVersion.StandaloneTitleId,
            selectedCustomTitleSetId: titleObj.lastVersion.setId
        })
        
        this.setEndorsersVisibility(true);
    },
    ...mapActions('titles', [
        'setTitlesDialogVisibility',
        'addTitleToPage',
        'modifyCustomTitleInPage',
        'setDisplayedTitle',
        'setEndorsersVisibility',
        'setEndorsersTitleIds',
        'setHistoryVisibility',
        'populateTitleHistory'
    ])

    },
    watch: {
        titles: function(newVal) {
        }
    },
    mixins: [timeHelpers]
}
</script>
<style>
html {
    width: 100vw;
    height: 100vh;
    top: 0px; 
}

.custom-titles-container-card {
    overflow: auto;
    /* max-height: min(100%, 50vh); */
}
</style>