<template>
<v-dialog v-model="dialogVisible" width="400px">
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

      <v-card max-height="50vh" class="pa-1" >
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

       <v-divider></v-divider>

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
                    <span v-if="titleObj.history.length" class="ml-2 caption grey--text text--darken-1 cursor-pointer"
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
                        v-if="titleObj.userEndorsed" color="primary" small class="xs-icon-font cursor-pointer">
                            {{icons.thumbUpFilled}}
                        </v-icon>
                        <v-icon @click="changeEndorsement(titleObj, index, true)" v-else
                        color="primary" small class="xs-icon-font cursor-pointer">
                            {{icons.thumbUpOutline}}
                        </v-icon>
                    </v-col>

                    <v-col cols="11" v-if="titleObj.author.id == user.id">

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
        <title-history namespace="farnaz"></title-history>
    <!-- </v-slide-x-reverse-transition> -->
    </v-dialog>
</template>

<script>
import customAvatar from '@/components/CustomAvatar'
import deleteConfirmationDialog from '@/components/DeleteConfirmationDialog'
import titleHistory from '@/components/TitleHistory'

import timeHelpers from '@/mixins/timeHelpers'
// import titleServices from '@/services/titleServices'
import { mapState, mapActions } from 'vuex'
import { mdiWindowClose, mdiPencil, mdiTrashCanOutline, mdiCheck,
    mdiCloseCircleOutline, mdiThumbUpOutline, mdiThumbUp } from '@mdi/js';

export default {
    components: {
        'custom-avatar': customAvatar,
        'delete-dialog': deleteConfirmationDialog,
        'title-history': titleHistory
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
    props: ['titleId', 'titleText', 'titleElementId'],
    created() {
        // browser.tabs.query({ active: true, currentWindow: true })
        // .then( tabs => {
        //     browser.tabs.sendMessage(tabs[0].id, { type: "open_custom_titles" });
        // })
    },
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

            if (this.titleId){
                console.log(this.titles.find(title => title.id == this.titleId))
                return this.titles.find(title => title.id == this.titleId);
            }
            else
                return null;
        },
        ...mapState('auth', [
            'user'
        ]),
        ...mapState('titles', [
            'titles',
            'titlesDialogVisible'
        ]),
        // ...mapState('pageDetails', [
        //     'url',
        //     'identifiedHeadline'
        // ])
    },
    methods: {
        returnToHome: function() {
   
            this.setTitlesDialogVisibility(false);
            this.$router.push({ name: 'home' });
            
        },
        postNewTitle: function() {
            if (this.$refs.newTitleForm.validate()) {
                this.postBtnDisabled = true;

                let pageIndentifiedTitle = this.titleId ? this.associatedStandaloneTitle.text :
                    this.titleText;
                // titleServices.postCustomTitle({ 
                //     postId: this.associatedStandaloneTitle ? this.associatedStandaloneTitle.PostId : null,
                //     postUrl: this.url,
                //     customTitleText: this.newTitle,
                //     pageIndentifiedTitle: pageIndentifiedTitle })
                // .then(res => {
                //     this.newTitle = '';
                //     this.$refs.newTitleForm.resetValidation();
                //     this.addTitleToPage({
                //         hash: res.data.data.hash,
                //         titleElementId: this.titleElementId
                //     })
                //     .then(() => {
                //         this.$router.push({ name: 'customTitles',  
                //             params: { 
                //                 titleId: res.data.data.id
                //             }
                //         })
                //         .catch(err => {
                //             console.log(err);
                //         })
                //     })
                // })
                // .catch(err => {
                //     console.log(err)
                //     this.alertMessage = err.response.data.message;
                //     this.alert = true;
                // })
                // .finally(() => {
                //     this.postBtnDisabled = false;
                // })
            }
        },
    changeEndorsement: function(titleObj, arrIndex, endorsementVal) {
    //   titleServices.setEndorsementStatus({
    //     setId: titleObj.lastVersion.setId
    //   },
    //   {
    //     endorse_status: endorsementVal
    //   })
    //   .then(res => {
    //     titleServices.hasUserEndorsedTitle({ setId: titleObj.lastVersion.setId })
    //     .then(res => {
    //       titleObj['userEndorsed'] = res.data;
    //     //   this.fetchPostTitles();
    //     })
    //   })
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
        let index = this.associatedStandaloneTitle.StandaloneCustomTitles.findIndex(customTitle => 
            customTitle.setId == this.edit.setId);
        this.$refs.editTitleForm[index].resetValidation();
        this.resetEdits();
      }

    //   titleServices.deleteCustomTitle({
    //     standaloneTitleId: this.associatedStandaloneTitle.id,
    //     setId: this.delete.selectedTitle.lastVersion.setId
    //   })
    //   .then(res => {
    //     this.delete.selectedTitle = null;
    //     // this.fetchPostTitles();
    //     this.modifyCustomTitleInPage({
    //         standaloneTitleId: this.associatedStandaloneTitle.id
    //     })
        
    //   })
    //   .catch(err => {
    //     this.alertMessage = err.response.data.message;
    //     this.alert = true;
    //   })

    },
    startEdit: function(title) {

      this.edit.on = true;
      this.edit.setId = title.lastVersion.setId;
      this.edit.text = title.lastVersion.text;
    },
    saveEdits: function() {

        let index = this.associatedStandaloneTitle.StandaloneCustomTitles.findIndex(customTitle => 
            customTitle.setId == this.edit.setId);
        
        console.log(this.associatedStandaloneTitle.PostId, this.edit.setId, this.edit.text)
        console.log(this.$refs)

        if (this.$refs.editTitleForm[index].validate()) {

            // titleServices.editCustomTitle({
            //     standaloneTitleId: this.associatedStandaloneTitle.id,
            //     setId: this.edit.setId
            // }, { text: this.edit.text })
            // .then(res => {

            //     this.resetEdits();
            //     this.$refs.editTitleForm[index].resetValidation();
            //     //   this.fetchPostTitles();
            //     this.modifyCustomTitleInPage({
            //         standaloneTitleId: this.associatedStandaloneTitle.id
            //     })
            // })
            // .catch(err => {
            //     this.alertMessage = err.response.data.message;
            //     this.alert = true;
            // })
        }

    },
    resetEdits: function() {

      this.edit.on = false;
      this.edit.setId = null;
      this.edit.text = '';
    },
    showHistory: function(titleObj) {

      this.populateTitleHistory(titleObj);
      this.setHistoryVisiblity(true);
    },
    ...mapActions('titles', [
        'setTitlesDialogVisibility',
        'addTitleToPage',
        'modifyCustomTitleInPage'
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
    position: fixed;
    width: 100vw;
    height: 100vh;
    top: 0px; 
    z-index: 999999;
}
</style>