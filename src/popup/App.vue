<template>
  <v-app>
    <router-view></router-view>
  </v-app>
</template>

<script>
import titleServices from './services/titleServices'

export default {
  name: 'popupApp',
  components: { },
  created() {
    console.log('this got created')
    browser.runtime.onMessage.addListener(function (message, sender, sendResponse) {
      if (message.type == 'get_title_hash_matches') {
        return new Promise((resolve, reject) => {
          titleServices.getTitleHashMatches(message.data)
          .then(response => {
            console.log('got it ', response.data)
            resolve(response.data);
          })
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
