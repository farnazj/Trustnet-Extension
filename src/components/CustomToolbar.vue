<template>
    <v-toolbar dense fixed color="lime lighten-1">

      <v-toolbar-title @click="goToPage('Home')" class="headline text-uppercase cursor-pointer">
        <span class="font-weight-light">Trustnet</span>
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <template v-if="isLoggedIn" class="center-aligned">
        <v-divider vertical inset class="mr-2"></v-divider>

        <v-menu v-model="settingsMenu"
          :close-on-content-click="false"
          :nudge-width="120" offset-y left attach>

          <template v-slot:activator="{ on: { click } }">
            <custom-avatar v-if="Object.entries(user).length" :size=40 class="mr-1"
              :user="user" :clickEnabled="false" v-on:click.native="click" ></custom-avatar>
          </template>
          <v-card>
            <v-list dense>
              <template v-for="item in settingItems">
                <v-list-item :key="item.name" @click="clickHandler(item.name)">

                  <v-list-item-action class="my-1" v-if="item.icon">
                    <v-icon>{{ item.icon }}</v-icon>
                  </v-list-item-action>

                  <v-list-item-content>
                    <v-list-item-title v-html="item.name"> </v-list-item-title>
                  </v-list-item-content>

                </v-list-item>
              </template>
            </v-list>
          </v-card>

        </v-menu>

      </template>

      <template v-else>
         <v-btn @click="goToPage(navigationText)" text>{{navigationText}}</v-btn>
      </template>

    </v-toolbar>
</template>

<script>
import customAvatar from '@/components/CustomAvatar'
import { mapGetters } from 'vuex'

export default {
  components: {
   'custom-avatar': customAvatar
  },
  data () {
    return {
      authUser: {},
      settingsMenu: false,
      settingItems: [
      {
        name: 'About', icon: 'help'
      }, {
        name: 'Logout', icon: 'power_settings_new'
      }]
    }
  },
  created() {
  },
  computed: {

    navigationText: function() {
      if (this.$route.name == 'Login')
        return 'About';
      else
        return 'Login';
    },
    ...mapGetters('auth', [
     'user',
     'isLoggedIn'
   ])
 },
 methods: {

   clickHandler: function(item) {
    if (item == 'Logout')
      return this.logout();
    else
      return this.goToPage(item);
   },
   logout: function() {
     this.$store.dispatch('auth/logout')
     .then(() => {
       this.$router.push('/login');
     });
   },
   goToPage: function(page) {
   
      this.$router.push({ name: page });
   }
 }
}
</script>

<style scoped>

.center-aligned {
    align-items: center;
}

</style>
