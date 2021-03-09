<template>
  <v-app>
    <router-view></router-view>
  </v-app>
</template>

<script>
import titleServices from './services/titleServices'
import sourceServices from './services/sourceServices'

export default {
  name: 'popupApp',
  components: { },
  created() {
    console.log('popup app got created')
    browser.runtime.onMessage.addListener(function (message, sender, sendResponse) {
      if (message.type == 'get_title_hash_matches') {
        return new Promise((resolve, reject) => {
          titleServices.getTitleHashMatches(message.data)
          .then(response => {
            resolve(response.data);
          })
        })
      }
      else if (message.type == 'arrange_custom_titles') {
        return new Promise((resolve, reject) => {

          let resTitles = message.data;
          let titleObjects = [];
          let titlesBySetId = {};

          if (resTitles) {
            resTitles.forEach(title => {

              if (!(title.setId in titlesBySetId )) {
                  let titleObj = {};
                  titleObj['history'] = [];
                  titlesBySetId[title.setId] = titleObj;
              }

              if (title.version != 1) {
                titlesBySetId[title.setId]['history'].push(title);
              }
              else {
                titlesBySetId[title.setId]['lastVersion'] = title;
              }
            })

            let allProms = [] ;
            for (const [setId, titleObj] of Object.entries(titlesBySetId)) {
              let titlesetProms = [
                sourceServices.getSourceById(titleObj['lastVersion'].SourceId),
                titleServices.hasUserEndorsedTitle({ setId: setId })
              ];

              allProms.push(Promise.all(titlesetProms)
              .then(resp => {
                titlesBySetId[setId]['author'] = resp[0].data;
                titlesBySetId[setId]['userEndorsed'] = resp[1].data;
                titleObjects.push(titlesBySetId[setId]);
              }))

            }
            Promise.all(allProms)
            .then(() => {
              resolve(titleObjects);
            });
          }

        })

      }
    })
  }
}
</script>

<style>
html {
  width: 400px;
  height: 400px;
}
</style>
